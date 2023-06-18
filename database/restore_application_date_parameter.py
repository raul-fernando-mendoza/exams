import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid
from datetime import datetime

date_format = '%Y%m%d'

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

docRef = db.collection_group("parameterGrades").get()

for doc in docRef:
    e = doc.to_dict()
    d_id = e["applicationDate"]
    d = datetime.strptime(str(d_id), date_format)

    print( e["label"] + " " + str(e["applicationDate"]) 
       + " " + str(int(d.strftime("%Y%m%d"))) 
       + " " + str(int(d.strftime("%Y%m"))) 
       + " " + str(int(d.strftime("%Y"))) 
    )
    json = {
        "applicationDay":d_id,
        "applicationDate":d
    }
    doc.reference.update(json)