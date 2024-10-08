from google.cloud import bigquery

import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid
from datetime import date, timedelta, datetime
from dateutil import tz
import json
import math
import time
from google.api_core.datetime_helpers import DatetimeWithNanoseconds
from firebase_admin import auth


DATASET = "thoth"

client = bigquery.Client()
dataset = client.dataset(DATASET)
PROJECT=client.project


firebase_admin.initialize_app()


logging.basicConfig(format='%(asctime)-15s %(message)s', level=logging.DEBUG)
log = logging.getLogger("backup")

db = firestore.client()

def if_tbl_exists(client, tableName):
    from google.cloud.exceptions import NotFound

    try:
        table_ref = dataset.table(tableName)
        client.get_table(table_ref)
        return True
    except NotFound:
        return False
    
def getSubcollectionData( doc, collectionName ):
    subCollectionArray = []
    for subDoc in doc.reference.collection(collectionName).get():
        data = subDoc.to_dict()
        for prop in data:
            if (type(data[prop]) is float or  type(data[prop]) is int ) and math.isnan( data[prop] ):
                data[prop] = None 
            if (type(data[prop]) is float) and data[prop].is_integer():
                data[prop] = int(data[prop]) 
            if (type(data[prop]) is date):
                data[prop] = data[prop].strftime('%Y-%m-%d %H:%M:%S')
            if isinstance(data[prop],DatetimeWithNanoseconds):
                data[prop] = data[prop].strftime('%Y-%m-%d %H:%M:%S')

        subCollections = subDoc.reference.collections()
        for subCollection in subCollections:
            subCollectionName = subCollection.id
            subCollectionData = getSubcollectionData( subDoc, subCollectionName )
            data[subCollectionName] = subCollectionData
        subCollectionArray.append(data)
    return subCollectionArray

def getJsonObject( doc ):
    data = doc.to_dict()
    for prop in data:
        if (type(data[prop]) is float or  type(data[prop]) is int ) and math.isnan( data[prop] ):
            data[prop] = None
        if (type(data[prop]) is float) and data[prop].is_integer():
            data[prop] = int(data[prop]) 
        if (type(data[prop]) is date):
            data[prop] = data[prop].strftime('%Y-%m-%d %H:%M:%S')
        if isinstance(data[prop],DatetimeWithNanoseconds):
            data[prop] = data[prop].strftime('%Y-%m-%d %H:%M:%S.%f')



    subCollections = doc.reference.collections()
    for subCollection in subCollections:
        subCollectionName = subCollection.id        
        subCollectionData = getSubcollectionData( doc, subCollectionName )
        data[subCollectionName] = subCollectionData

    strJson = json.dumps(data, sort_keys=True)

    obj = json.loads( strJson )  
    return obj       



def getExisting(tablename:str, id:str):
    
    QUERY = (
        "SELECT value FROM " + PROJECT + "." + DATASET + "." + tablename +
        " WHERE id = '" + id + "' " +
        " and valid_to is null"
        " LIMIT 1")
    query_job = client.query(QUERY)  
    rows = query_job.result() 
    if rows.total_rows > 0: 
        for row in rows:
            #print(row.value)
            obj = json.loads( row.value)
            return obj
    return None  

def getLastValidFromTable(tablename:str):
    
    QUERY = (
        "SELECT max( JSON_VALUE(value.updated_on)) as updated_on FROM " + PROJECT + "." + DATASET + "." + tablename + " where valid_to is null")
    query_job = client.query(QUERY)  
    rows = query_job.result() 
    if rows.total_rows > 0: 
        for row in list(rows):
            updated_on = row.get("updated_on")
            dt = None
            if updated_on != None:
                dt = datetime.fromisoformat(updated_on)                  
            return dt
    return None 

def create_table(tableName:str):
    table_id = bigquery.Table.from_string(PROJECT + "." + DATASET + "." + tableName)
    schema = [
        bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("value", "JSON", mode="REQUIRED"),
        bigquery.SchemaField("valid_from", "TIMESTAMP", mode="REQUIRED"),
        bigquery.SchemaField("valid_to", "TIMESTAMP",mode="NULLABLE")
    ]
    table = bigquery.Table(table_id, schema=schema)
    table = client.create_table(table)
    log.debug(
        "Created table {}.{}.{}".format(table.project, table.dataset_id, table.table_id)
    )

def insertRow(tableName:str, id:str, jsonValueStr:str, executionTime):
    today = date.today()

    table = client.get_table("{}.{}.{}".format(PROJECT, DATASET, tableName))

    rows_to_insert = [{u"id": id, u"value": jsonValueStr, u"valid_to":None, u"valid_from": executionTime }]

    log.debug("*** Insert row" + str(tableName) + ":" + str(id) )

    errors = client.insert_rows_json(table, rows_to_insert)

    if errors == []:
        return True
    else: 
        log.error('*** ERROR: {}'.format(str(errors)))
        return False   

def archiveOldRow(tableName:str, id:str, executionTime):
    try:
        log.debug("*** archiveOldRow " + str(tableName) + " row:" + str(id) )
        today = date.today()
        dml_statement = \
            "UPDATE " + PROJECT + "." + DATASET + "." + tableName + \
            " SET valid_to = '" + executionTime  + "'" \
            " WHERE id= '"+ str(id) + "'  and valid_to is null"
        query_job = client.query(dml_statement)  # API request
        query_job.result()  # Waits for statement to finish
        return True
    except Exception as e:
        log.error('*** ERROR: {}'.format(e.message))
        return False    

def getUserList():
    log.debug("Auth getUserList has been called")
    userlist = []
    
    for user in auth.list_users().iterate_all():
        userlist.append( { 
            "uid":user.uid,
            "email":user.email,
            "claims":user.custom_claims,
            "displayName":user.display_name
            }
        )
    return userlist

SUFFIX = "_snapshot"
USER_TABLE = "user" + SUFFIX

def backupAll(collections, fullRefresh=False):
    log.debug("**** Start Backup")

    today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    

    #save user list
    """
    
    tblExist = if_tbl_exists(client, USER_TABLE)
    if tblExist == False:
        create_table(USER_TABLE)
    for user in getUserList():
        valueNewStr = json.dumps(user, sort_keys=True)
        existingUser = getExisting( USER_TABLE, user["uid"] )        
        if existingUser:
            valueOldStr = json.dumps( existingUser , sort_keys=True)
            if valueNewStr != valueOldStr:
                if archiveOldRow(USER_TABLE, user["uid"] ) == False:
                    log.error("ERROR updating:" + user["uid"])
                    exit(1)
                if insertRow(USER_TABLE, user["uid"],valueNewStr) == False:
                    log.error("ERROR inserting:" + user["uid"])
                    exit(1)
        else:
            if insertRow(USER_TABLE, user["uid"],valueNewStr) == False:
                log.error("ERROR inserting:" + user["uid"])
                exit(1)        
    """
    #save all tables
    for c in collections:
        log.debug("collection:" + c) 

        tableName = c + str(SUFFIX)
        
        tblExist = if_tbl_exists(client, tableName)
        if tblExist == False:
            create_table(tableName )

        if fullRefresh == False:
            lastValidFrom = getLastValidFromTable(tableName)
            if lastValidFrom:
                print(lastValidFrom)


        coll = db.collection(c)
        if fullRefresh==False and lastValidFrom:            
            coll = coll.where("updated_on",">",lastValidFrom)
        docRef = coll.get()
        for doc in docRef:
            data = getJsonObject(doc)
            #logging.debug( json.dumps(data,  indent=4, sort_keys=True) )
            valueNewStr = json.dumps(data, sort_keys=True)
            existingObj = getExisting( tableName, data["id"] )        
            if existingObj:
                valueOldStr = json.dumps( existingObj , sort_keys=True)
                if valueNewStr != valueOldStr:
                    if archiveOldRow(tableName, data["id"], today ) == False: 
                        log.error("*** ERROR updating:" + data["id"])
                        exit(1)
                    if insertRow(tableName, data["id"],valueNewStr, today) == False:
                        log.error("*** ERROR inserting:" + data["id"])
                        exit(1)
            else:
                if insertRow(tableName, data["id"],valueNewStr, today) == False:
                    log.error("*** ERROR inserting:" + data["id"])
                    exit(1)
    log.debug("**** End Backup")


if __name__ == "__main__":
    all_collections=["examGrades"]
    #all_collections=["examGrades","careerAdvance","careers","employee","laboratoryGrades","materiaEnrollments","materias","organizations","exams","groups","niveles","revision"]
   
    backupAll(all_collections, True)
        


