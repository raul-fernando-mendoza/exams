import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid

#uses the FIREBASE_CONFIG from the environment variables
firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

docRef = db.collection("careers").get()

for doc in docRef:
    e = doc.to_dict()
    print( str(doc.id) + " "  + str(e["career_name"])  )
    if "isPublished" not in e:
        json = {
            "isPublished":True
        }
        print( json  )
        db.collection("careers").document(doc.id).update(json)
    else:
        print( "-already modified")
print("end---")
    