import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

docRef = db.collection_group("parameterGrades").get()

for doc in docRef:
    e = doc.to_dict()
    d = e["applicationDate"]
    print( e["label"] + " " + str(e["applicationDate"]) 
       + " " + str(int(d.strftime("%Y%m%d"))) 
       + " " + str(int(d.strftime("%Y%m"))) 
       + " " + str(int(d.strftime("%Y"))) 
    )
    json = {
        "applicationDay":int(d.strftime("%Y%m%d")),
        "applicationMonth":int(d.strftime("%Y%m")),
        "applicationYear":int(d.strftime("%Y"))
    }
    doc.reference.update(json)