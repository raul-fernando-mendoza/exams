import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

docRef = db.collection_group("aspectGrades").get()

for doc in docRef:
    e = doc.to_dict()
    if e["score"] == None:
        print( "update:" + doc.reference.path)
        json = {
            "score":1
        }
        doc.reference.update(json)
    #db.collection("examGrades").document(doc.id).update(json)