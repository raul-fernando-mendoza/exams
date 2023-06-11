from google.cloud import bigquery

PROJECT = "thoth-qa"
DATASET = "thoth"
TABLE= "examgrade"

bq_client = bigquery.Client()
QUERY = (
    "SELECT value FROM " + PROJECT + "." + DATASET + "." + TABLE +
    " WHERE id = '001' " +
    " LIMIT 100")
query_job = bq_client.query(QUERY)  
rows = query_job.result()  
for row in rows:
    print(row.value)

print("end")