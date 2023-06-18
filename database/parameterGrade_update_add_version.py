import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()

eGradeRef = db.collection("examGrades").get()

for eGradeDoc in eGradeRef:
    e = eGradeDoc.to_dict()     
    print(  e["id"] + " " + e["title"]  )
    #appDate = e["applicationDate"]
    #creDate = e["created_on"] if "created_on" in e else e["applicationDate"]
    #updDate = e["updated_on"] if "updated_on" in e else e["applicationDate"]
    #eUpdate = {
    #    "applicationDate":int(appDate.strftime("%Y%m%d")) ,
    #    "created_on":int(creDate.strftime("%Y%m%d")),
    #    "updated_on":int(updDate.strftime("%Y%m%d"))
    #}

    #eGradeDoc.reference.update(eUpdate)

    pGradeRef = db.collection("examGrades/" + e["id"] + "/parameterGrades").get()
    for pGradeDoc in pGradeRef:
        p = pGradeDoc.to_dict()
        appParamDate = p["applicationDate"]

        print( "-" + p["id"] + " " + p["label"])
        json = {
            "version":0,
            "isCurrentVersion":True
        }
        pGradeDoc.reference.update(json)