import sys
import datetime
import json
import logging
import mysql.connector

log = logging.getLogger("exam_app")

class MySql:
    cnx = None

    def __init__(self):
        self.cnx = mysql.connector.connect(
        user="eApp",
        password="odroid",     
        host="localhost",
        
        database="entities"
        )
        log.debug(self.cnx)         

    def getConnection(self):
        return self.cnx
    
    def close(self):
        self.cnx.close()

    def getConstraints(self, childTable, parentTable):
        try:
            referenced_table_schema = []
            cursor = self.getConnection().cursor()            
            query = """
            SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
            FROM
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE
            REFERENCED_TABLE_SCHEMA = 'entities' AND
            TABLE_NAME = %s AND
            REFERENCED_TABLE_NAME = %s
            """
            cursor.execute(query, (childTable, parentTable))


            for (table_name, column_name, constraint_name, reference_table_name, referenced_column_name) in cursor:
                log.debug("constraint:{}, {} , {}, {}, {}".format(
                table_name, column_name, constraint_name, reference_table_name, referenced_column_name))
                obj = {
                    "table_name":table_name, 
                    "column_name":column_name, 
                    "constraint_name":constraint_name, 
                    "reference_table_name":reference_table_name, 
                    "referenced_column_name":referenced_column_name
                }
                referenced_table_schema.append(obj)
        except Exception as e:
            log.error("Exception getConstraints" + str(e))
              
        finally:
            cursor.close()

        return referenced_table_schema      



class Table:
    parentTableName = None
    tableName = None
    tableFilter = None
    isList = False
    def __init__(self,parentTableName, tableName, filter):
        log.debug( "new Table(%s,%s)", str(parentTableName) , str(tableName) ), 
        self.parentTableName = parentTableName
        self.tableName = tableName
        
        if isinstance( filter, list ):
            self.tableFilter = filter[0]
            self.isList = True
        else:
            self.tableFilter = filter 

        log.debug("tableFilter:%s", self.tableFilter)       

    def getSelect(self):
        exp = ""
        for key in self.tableFilter.keys():
            value = self.tableFilter[key]
            if not isinstance(value,dict) and not isinstance(value,list):
                if exp != "":
                    exp = exp + ", "
                exp = exp + self.tableName + "." + str(key) + " as '" + self.tableName + "." + str(key) + "'"
        return exp

    def getWhereExpression(self):
        where = ""

        for key in self.tableFilter.keys():
            value = self.tableFilter[key]
            if value != "":
                if not isinstance(value,dict) and not isinstance(value,list): 
                    if where != "": 
                        where = where + " and "
                    if isinstance(value,str):
                        where = where + " " + self.tableName + "." + key + " = '" + str(value) + "'"
                    else:
                        where = where + " " + self.tableName + "." + key +  " = " + str(value) 
                
        return where

    def createObjectFromRow( self, row ):
        obj = {}
        for key in self.tableFilter.keys():
            value = self.tableFilter[key]
            if not isinstance(value,dict) and not isinstance(value,list):
                rowValue = row[self.tableName + "." + key]
                if isinstance(rowValue , datetime.datetime):
                    obj[key] = rowValue.strftime("%Y/%m/%d %H:%M:%S")
                else:
                    obj[key] = rowValue
        return obj
    
    def compareObjToRow(self, obj, row ):
        for key in self.tableFilter.keys():
            value = self.tableFilter[key]
            if not isinstance(value,dict) and not isinstance(value,list):
                rowValue = row[self.tableName + "." + key]
                if isinstance(rowValue , datetime.datetime):
                    v = rowValue.strftime("%Y/%m/%d %H:%M:%S")
                else:
                    v = rowValue                
                if obj[key] != v:
                    return False
        return True        

class Qry:
    tables = []
    reservedWords = ("orderBy","pagination")

    def __init__(self):
        self.tables = []

    def createTableList(self, parentTable, request):
        try:
            for key in request.keys():
                if (isinstance(request[key],dict) or isinstance(request[key],list) ) and key not in self.reservedWords:
                    t = Table(parentTable, key, request[key])
                    self.tables.append( t )
                    self.createTableList( key, t.tableFilter )
        except Exception as e:
            log.error("Exception: createTableList" + str(e))
            raise e

    def getTableByName(self,tableName):
        for i in range(0,len(self.tables)):
            if self.tables[i].tableName == tableName :
                return self.tables[i]
        return None

    def fillObjectFromRow(self, obj, objRow,  request):
        try:
            for key in request.keys():
                log.debug("filling object key %s", key)
                keyValue = request[key]
                if isinstance(keyValue,dict) or isinstance(keyValue,list):
                    log.debug("key %s is a %s" , key, type(keyValue))
                    if isinstance(keyValue,list):
                        filter = keyValue[0]
                    else:
                        filter = keyValue                
                    t = self.getTableByName(key)
                    newObj = t.createObjectFromRow( objRow )
                    #ensure there is a lastObject
                
                    if key not in obj:
                        log.debug("object %s is null creating new", key) 
                        if t.isList:
                            log.debug("objet %s is array creating new", key)
                            obj[key] = [] 
                            obj[key].append( newObj )                           
                        else:
                            log.debug("object %s is object creating new", key)
                            obj[key] = newObj
                        lastObject = newObj
                    else:
                        if t.isList:
                            log.debug("object %s was not null and array retring last", key)        
                            lastObject = obj[key][-1]
                        else:
                            log.debug("object %s was not null and object retrivig last")
                            lastObject = obj[key] 
                    #compare the new row to the previous one and if false then there should be a new row
                    log.debug("compare vs last Object")
                    if t.compareObjToRow( lastObject, objRow) == False:
                        log.debug("new row is different from last adding row")
                        obj[key].append( newObj )
                        lastObject = newObj
                    log.debug("call for sub filters")
                    self.fillObjectFromRow( lastObject, objRow, filter) 
        except Exception as e:
            log.error("fillObjectFromRow:" + str(e))
            raise e                

    def buildObject(self, request, query):
        try:
            result = None
            mydb = MySql()
            cursor = mydb.getConnection().cursor()
            log.debug("excecuting query")            
            cursor.execute(query)
            column_names = cursor.column_names 
            
            for row in cursor:
                objRow = dict(zip(column_names,row))
               
                #log.debug( json.dumps(obj,  indent=4, sort_keys=True) )
                for i in range(0,len(column_names)):
                    log.debug("%s:%s", column_names[i], objRow[column_names[i]] )

                
                for key in request.keys():
                    keyValue = request[key]
                    if ( isinstance(keyValue,dict) or isinstance(keyValue,list) ) and key not in self.reservedWords:
                        log.debug("creating object for:%s", key)
                        if ( isinstance(keyValue,dict) or isinstance(keyValue,list) ):
                            filter = keyValue[0]
                        else:
                            filter = keyValue
                        t = self.getTableByName(key)
                        newObj = t.createObjectFromRow( objRow )
                        #ensure there is a lastObject
                        
                        if result == None: 
                            log.debug("key %s is null creating new", key)
                            if t.isList:
                                log.debug("key % is array creating new")
                                result = [] 
                                result.append( newObj )                           
                            else:
                                log.debug("key % is object creating new", key)
                                result = newObj
                            lastObject = newObj
                        else:
                            log.debug("key %s is not null retring last", key)
                            if t.isList:        
                                lastObject = result[-1]
                            else:
                                lastObject = result 
                        #compare the new row to the previous one and if false then there should be a new row
                        log.debug("comparing objects")
                        if t.compareObjToRow( lastObject, objRow) == False:
                            log.debug("last object is not the same creating new row")
                            result.append( newObj )
                            lastObject = newObj

                        self.fillObjectFromRow( lastObject, objRow, filter) 
        except Exception as e:
            log.error("Exception buildObject:" + str(e))
              
        finally:
            cursor.close()
            mydb.close()

        return result

    def buildQry(self, request):
        try:
            mydb = MySql()    
            self.createTableList( None, request)

            log.debug("self.tables length %i", len(self.tables))
            select = "SELECT "
            for i in range(0, len(self.tables)):
                t = self.tables[i]
                if i != 0:
                    select = select + ","
                select = select + t.getSelect() + "\n"
                log.debug("select %i table:%s temp:%s",i, t.tableName, select )

            log.debug("select:" + select)

            log.debug("creating join")

            join = ""
            for i in range(0, len(self.tables)):
                
                t = self.tables[i]
                if i == 0:
                    join = "FROM " + t.tableName 
                else:
                    join = join + " JOIN " + t.tableName + " ON ("
                
                    constraints = mydb.getConstraints( t.parentTableName, t.tableName )

                    if len(constraints) == 0 :
                        constraints = mydb.getConstraints( t.tableName, t.parentTableName )

                    if len(constraints) == 0:
                        raise Exception("no FK found for tables "+ t.tableName + " and " + t.parentTableName)

                    for j in range(0,len(constraints)):
                        c = constraints[j]
                        if j != 0:
                            join = join + " AND "
                        join = join + c["table_name"] + "." + c["column_name"] + " = " + c["reference_table_name"] + "." + c["referenced_column_name"]
                    join = join + ")"

            log.debug( "join:" + join )

            log.debug("creating where")
            where = ""
            for i in range(0, len(self.tables)):
                t = self.tables[i]
                if i == 0:
                    w = t.getWhereExpression()
                    if w != "":
                        where =  t.getWhereExpression()
                else:
                    w = t.getWhereExpression() 
                    if w != "":
                        where = " " + where + " AND " + w 
            log.debug( "where:" + where )

            qry = select + join 
            if where !="" :
                qry = qry + "\nWHERE " +  where

            orderExp = ""
            if "orderBy" in request:
                orderBy = request["orderBy"] 
                for key in orderBy:
                    if orderExp != "":
                        orderExp = orderExp + ","
                    orderExp = orderExp + key + " " + orderBy[key]

            if orderExp != "":
                qry = qry + "\nORDER BY " + orderExp

            paginationExp = ""
            if "pagination" in request:
                pagination = request["pagination"] 
                if "limit" in pagination:
                    limit =  pagination["limit"]
                    paginationExp = "limit " + str(limit) 
                if "offset" in pagination:
                    offset =  pagination["offset"]
                    paginationExp = paginationExp + " offset " + str(offset) 

            if paginationExp != "":
                qry = qry + "\n" + paginationExp

            log.debug("qry:%s", qry)
            return qry
            
        except Exception as e:
            log.error("Exception executeQry %s",str(e))
            raise e
        finally:
            mydb.close()

    def executeQry(self,request):
        qry = self.buildQry(request)
        obj = self.buildObject(request, qry)
        return obj
       
    def toJSON(self):
        return self.data        

def getObject(request):
    try:
        q = Qry()
        log.debug("len( q.tables ):%i", len( q.tables ) )
        obj = q.executeQry( request )
        return obj
    except Exception as e:
        log.error("error:" + str(e) )

def addObject(request):
    try:
        mydb = MySql()
        connection = mydb.getConnection()
        cursor = connection.cursor()
        rowid = None
        database = ""
        fieldsExp = ""
        valuesExp = ""
        for key in request:
            database = key
            record = request[database]
            for field in record:
                if valuesExp != "":
                    valuesExp = valuesExp + "," 
                    fieldsExp = fieldsExp + "," 
                value = record[field]
                if isinstance(value,str):                    
                    valuesExp = valuesExp + "'" + value + "'"
                else:
                    valuesExp = valuesExp + str(value)
                fieldsExp = fieldsExp + field              
        sql = "INSERT INTO " + database + "(" + fieldsExp + ") values(" + valuesExp + ")"
        log.debug("sql:" + sql)
        
        cursor.execute(sql)
        connection.commit()
        rowid= cursor.lastrowid
    except Exception as e:
        log.error("Exception addObject:" + str(e) )
        cursor.close()
        connection.rollback()
        return { "error":str(e)}
    finally:
        mydb.close()
    return { "id":rowid}


def updateObject(request):

    try:
        mydb = MySql()
        connection = mydb.getConnection()
        cursor = connection.cursor()
        rowid = None        
        database = ""
        updateExp = ""
        whereExp = ""
        for key in request:
            if key != "where":
                database = key
                record = request[database]
                for field in record:
                    if updateExp != "":
                        updateExp = updateExp + "," 
                    value = record[field]
                    if isinstance(value,str):                    
                        updateExp = updateExp + field + "="+  "'" + value + "'"
                    else:
                        updateExp = updateExp + field + "="+  str(value)
        record = request["where"]
        for field in record:
            if whereExp != "":
                whereExp = whereExp + "," 
            value = record[field]
            if isinstance(value,str):                    
                whereExp = whereExp + field + "="+  "'" + value + "'"
            else:
                whereExp = whereExp + field + "="+  str(value)

        sql = "UPDATE " + database + " set " + updateExp + " WHERE " + whereExp
        log.debug("sql:" + sql)
        
        cursor.execute(sql)
        connection.commit()
    except Exception as e:
        log.error("Exception addObject:" + str(e) )
        cursor.close()
        connection.rollback()
        return { "error":str(e)}
    finally:
        mydb.close()
    return { "status":"OK"}


if __name__ == "__main__":
    print("hello mysql_connect")