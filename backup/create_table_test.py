from google.cloud import bigquery


PROJECT = "thoth-qa"
DATASET = "thoth"
TABLE= "examgrade"

bq_client = bigquery.Client()

def create_table(tableName):
    table_id = bigquery.Table.from_string(PROJECT + "." + DATASET + "." + tableName)
    schema = [
        bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("value", "JSON", mode="REQUIRED"),
        bigquery.SchemaField("valid_from", "DATE", mode="REQUIRED"),
        bigquery.SchemaField("valid_to", "DATE",mode="NULLABLE")
    ]
    table = bigquery.Table(table_id, schema=schema)
    table = bq_client.create_table(table)
    print(
        "Created table {}.{}.{}".format(table.project, table.dataset_id, table.table_id)
    )


create_table("first_table")