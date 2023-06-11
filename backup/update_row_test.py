from google.cloud import bigquery
from datetime import date

client = bigquery.Client()

PROJECT = "thoth-qa"
DATASET = "thoth"

def updateRow(tableName:str, id:str):
    try:
        today = date.today()
        dml_statement = \
            "UPDATE " + PROJECT + "." + DATASET + "." + tableName + \
            " SET valid_to = CAST('" + today.strftime("%Y-%m-%d") + "' as date) " + \
            " WHERE id= '"+ str(id) + "'  and valid_to is null"
        query_job = client.query(dml_statement)  # API request
        query_job.result()  # Waits for statement to finish
        return True
    except:
        return False

if updateRow("examgrade", "001"):
    print("success")
else:
    print("error")