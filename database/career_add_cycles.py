import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

docRef = db.collection("careers").get()

for doc in docRef:
    e = doc.to_dict()
    print( str(doc.id) + " " + str(e["career_name"])  )
    if "cycles" not in e:
        json = {
            "cycles":[]
        }
        print( json  )
        db.collection("careers").document(doc.id).update(json)
    else:
        print( "-already modified")
print("end---")
    