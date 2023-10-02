import firebase_admin
from firebase_admin import firestore
import json
import logging
import uuid
from datetime import datetime

firebase_admin.initialize_app()

log = logging.getLogger("cheneque")

db = firestore.client()
print( db.project )

eGradeRef = db.collection("examGrades").get()

dt = datetime.now()
ts = datetime.timestamp(dt)


for eGradeDoc in eGradeRef:
    e = eGradeDoc.to_dict()     
    print(  e["id"] + " " + e["title"]  )
    updated = False


    pGradeRef = db.collection("examGrades/" + e["id"] + "/parameterGrades").get()
    print( len(pGradeRef) )
    for pGradeDoc in pGradeRef:
        pg = pGradeDoc.to_dict()
        

        print( "-" + pg["id"] + " " + pg["label"])

        cGradeRef = db.collection("examGrades/" + e["id"] + "/parameterGrades/" + pg["id"] + "/criteriaGrades").get()
        for cGradeDoc in cGradeRef:
            cg = cGradeDoc.to_dict()
            if "id" in cg and "label" in cg:
                print("--" + str(cg["id"]) + " " + str(cg["label"]))

                earnedPoints = 0
                availablePoint = 0

                aGradeRef = db.collection("examGrades/" + e["id"] + "/parameterGrades/" + pg["id"] + "/criteriaGrades/" + cg["id"] + "/aspectGrades").get()            
                for aGradeDoc in aGradeRef:
                    ag = aGradeDoc.to_dict()
                    print("---" + ag["id"] + " " + ag["label"] + " " + str(ag["score"]))
                    availablePoint += 1
                    earnedPoints += ag["score"] if ag["score"]!=None else 0
                if availablePoint > 0:
                    json = {
                        "availablePoint":availablePoint,
                        "earnedPoints":earnedPoints,
                        "score": round(earnedPoints/availablePoint * 10,1)
                    }
                    print( "--" + "availablePoint:" + str(json["availablePoint"]))
                    print( "--" + "earnedPoints:" + str(json["earnedPoints"]))
                    print( "--" + "score:" + str(json["score"]))
                    if( "availablePoint" in cg and cg["availablePoint"] != json["availablePoint"] and
                        "earnedPoints" in cg and cg["earnedPoints"] != json["earnedPoints"] and
                        "score" in cg and cg["availablePoint"] != json["availablePoint"] ):
                        print("no need to update")
                    else:
                        updated = True
                        cGradeDoc.reference.update(json)
            else:
                print("not valid")
    if updated:
        eUpdate = {
            "updated_on":dt
        }        
        print("update")
        eGradeDoc.reference.update(eUpdate)