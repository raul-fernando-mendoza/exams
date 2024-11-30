import firebase_admin
from firebase_admin import firestore
import json
from datetime import  datetime, timezone

# Your web app's Firebase configuration

firebase_admin.initialize_app()



db = firestore.client()

#collections=["examGrades","careerAdvance","careers","employee","laboratoryGrades","materiaEnrollments","materias","organizations","exams","groups","niveles","revision"]
collections=["examGrades"] #,"examGrades","laboratoryGrades","materiaEnrollments"]
# timestamp is number of seconds since 1970-01-01 
timestamp = 1545730073
# convert the timestamp to a datetime object in the local timezone
tz = datetime.fromtimestamp(timestamp)
utc = tz.replace(tzinfo=timezone.utc)
ts = utc.astimezone()

old_student_uid = "FhOVouoj2Netz002Iec9H6TCtW32"
new_student_uid = "ZjyRNUtyDLUNo2KOcd6J7QIvmf72"

for c in collections:
    print("collection:" + c) 

    docRef = db.collection("examGrades").get()

    for doc in docRef:
        data = doc.to_dict()
        if "student_uid" in data:            
            if data["student_uid"] == old_student_uid :
                print( json.dump(data) ) 
                json = {
                    "updated_on": ts,
                    "student_uid": new_student_uid,
                    "old_student_uid": old_student_uid
                }
                #db.collection(c).document(doc.id).update(json)