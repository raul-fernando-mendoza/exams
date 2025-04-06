import firebase_admin
from firebase_admin import firestore
import json
from datetime import  datetime, timezone
import time
# Your web app's Firebase configuration

firebase_admin.initialize_app()



db = firestore.client()

#collections=["examGrades","careerAdvance","careers","employee","laboratoryGrades","materiaEnrollments","materias","organizations","exams","groups","niveles","revision"]
collections=["examGrades","careerAdvance","careers","employee","laboratoryGrades","materiaEnrollments","materias","organizations","exams","groups","niveles","revision"]
# timestamp is number of seconds since 1970-01-01 
timestamp = time.time()
# convert the timestamp to a datetime object in the local timezone
tz = datetime.fromtimestamp(timestamp)
utc = tz.replace(tzinfo=timezone.utc)
ts = utc.astimezone()

old_student_uid = "mLsUyFvmlqRyIEKM4dH8UyZVBEQ2"
new_student_uid = "wJmeADgOjygZp9bIlnPhSqhbRkY2"

for c in collections:
    print("collection:" + c) 

    docRef = db.collection("examGrades").where("student_uid", "==", old_student_uid).get()

    for doc in docRef:
        data = doc.to_dict()
        if "student_uid" in data:            
            if data["student_uid"] == old_student_uid :
                print( json.dumps(data, indent=4, sort_keys=True, default=str) ) 
                updated_values = {
                    "updated_on": ts,
                    "student_uid": new_student_uid,
                    "old_student_uid": old_student_uid
                }
                #db.collection(c).document(doc.id).update(updated_values)
