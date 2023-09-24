import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid
from datetime import date, timedelta, datetime, timezone

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

#collections=["examGrades","careerAdvance","careers","employee","laboratoryGrades","materiaEnrollments","materias","organizations","exams","groups","niveles","revision"]
collections=["careerAdvance","careers","employee","laboratoryGrades","materiaEnrollments","materias","organizations","exams","groups","niveles","revision"]
# timestamp is number of seconds since 1970-01-01 
timestamp = 1545730073
# convert the timestamp to a datetime object in the local timezone
tz = datetime.fromtimestamp(timestamp)
utc = tz.replace(tzinfo=timezone.utc)
ts = utc.astimezone()


for c in collections:
    log.debug("collection:" + c) 

    docRef = db.collection(c).get()

    for doc in docRef:
        data = doc.to_dict()
        if "updated_on" in data:
            if data["updated_on"] == ts :
                print( c, data["id"] ) 
                json = {
                    "updated_on": firestore.DELETE_FIELD,
                    "created_on": firestore.DELETE_FIELD
                }
                db.collection(c).document(doc.id).update(json)
            else:
                print( "FOUND:", data["id"], data["updated_on"] )  