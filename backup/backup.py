from google.cloud import bigquery

import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid
from datetime import date
import json
import math
from google.api_core.datetime_helpers import DatetimeWithNanoseconds

PROJECT = "thoth-qa"
DATASET = "thoth"

client = bigquery.Client(PROJECT)
dataset = client.dataset(DATASET)


firebase_admin.initialize_app()


logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.DEBUG)
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
            data[prop] = data[prop].strftime('%Y-%m-%d %H:%M:%S')



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
            print(row.value)
            obj = json.loads( row.value)
            return obj
    return None  


def create_table(tableName:str):
    table_id = bigquery.Table.from_string(PROJECT + "." + DATASET + "." + tableName)
    schema = [
        bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("value", "JSON", mode="REQUIRED"),
        bigquery.SchemaField("valid_from", "TIMESTAMP", mode="REQUIRED", default_value_expression="CURRENT_TIMESTAMP()"),
        bigquery.SchemaField("valid_to", "TIMESTAMP",mode="NULLABLE")
    ]
    table = bigquery.Table(table_id, schema=schema)
    table = client.create_table(table)
    print(
        "Created table {}.{}.{}".format(table.project, table.dataset_id, table.table_id)
    )

def insertRow(tableName:str, id:str, jsonValueStr:str):
    today = date.today()

    table = client.get_table("{}.{}.{}".format(PROJECT, DATASET, tableName))

    rows_to_insert = [{u"id": id, u"value": jsonValueStr, u"valid_to":None}]

    errors = client.insert_rows_json(table, rows_to_insert)

    if errors == []:
        return True
    else: return False   

def updateRow(tableName:str, id:str):
    try:
        today = date.today()
        dml_statement = \
            "UPDATE " + PROJECT + "." + DATASET + "." + tableName + \
            " SET valid_to = CURRENT_TIMESTAMP() " + \
            " WHERE id= '"+ str(id) + "'  and valid_to is null"
        query_job = client.query(dml_statement)  # API request
        query_job.result()  # Waits for statement to finish
        return True
    except Exception as e:
        log.error('ERROR: {}'.format(e.message))
        return False    

#collections=["examGrades","drawings","Revision"]
collections=["examGrades","careerAdvance","careers","employee","laboratoryGrades","materiaEnrollments","materias","organizations"]

for c in collections:
    log.debug("collection:",c) 

    tableName = c #.lower()
    
    tblExist = if_tbl_exists(client, tableName)
    if tblExist == False:
        create_table(tableName)
    docRef = db.collection(c).get()
    for doc in docRef:
        data = getJsonObject(doc)
        #logging.debug( json.dumps(data,  indent=4, sort_keys=True) )
        valueNewStr = json.dumps(data, sort_keys=True)
        existingObj = getExisting( tableName, data["id"] )        
        if existingObj:
            valueOldStr = json.dumps( existingObj , sort_keys=True)
            if valueNewStr != valueOldStr:
                if updateRow(tableName, data["id"] ) == False:
                    log.error("ERROR updating:" + data["id"])
                    exit(1)
                if insertRow(tableName, data["id"],valueNewStr) == False:
                    log.error("ERROR inserting:" + data["id"])
                    exit(1)
        else:
            if insertRow(tableName, data["id"],valueNewStr) == False:
                log.error("ERROR inserting:" + data["id"])
                exit(1)
log.debug("End")



        


