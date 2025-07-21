import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

docRef = db.collection("examGrades").get()

for doc in docRef:
    e = doc.to_dict()
    print( str(doc.id) + " " + str(e["student_uid"]) + " " + str(e["title"])  )
    if "studentUids" not in e:
        json = {
            "studentUids":[ e["student_uid"] ]
        }
        print( json  )
        db.collection("examGrades").document(doc.id).update(json)
    else:
        print( "-already modified")
print("end---")
    