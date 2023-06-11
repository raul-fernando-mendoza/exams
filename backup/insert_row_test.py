from google.cloud import bigquery
from datetime import date
today = date.today()

PROJECT = "thoth-qa"
DATASET = "thoth"
TABLE= "examGrades"

bq_client = bigquery.Client()
table = bq_client.get_table("{}.{}.{}".format(PROJECT, DATASET, TABLE))

rows_to_insert = [{u"id": "qlm", u"value": '{"name": "Alice", "age": 30}', u"valid_from":today.strftime("%Y-%m-%d"), u"valid_to":None} ]

errors = bq_client.insert_rows_json(table, rows_to_insert)

if errors == []:
    print("success")