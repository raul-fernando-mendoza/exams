from google.cloud import bigquery

PROJECT = "thoth-qa"
DATASET = "thoth"
TABLE= "examgrade1"

client = bigquery.Client(PROJECT)
dataset = client.dataset(DATASET)
table_ref = dataset.table(TABLE)

def if_tbl_exists(client, table_ref):
    from google.cloud.exceptions import NotFound
    try:
        client.get_table(table_ref)
        return True
    except NotFound:
        return False

tblExist = if_tbl_exists(client, table_ref)
print( tblExist )