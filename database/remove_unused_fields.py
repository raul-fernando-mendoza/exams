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

docRef = db.collection("examGrades").get()

for doc in docRef:
    e = doc.to_dict()

    print( e["title"] + " " + str(e["applicationDate"]) 
    )
    json = {
        "applicationDateId":firestore.DELETE_FIELD,
        "applicationDayId":firestore.DELETE_FIELD,
        "applicationMonthId":firestore.DELETE_FIELD,

    }
    doc.reference.update(json)