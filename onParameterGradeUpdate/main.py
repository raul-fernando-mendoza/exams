import logging
from cloudevents.http import CloudEvent
import functions_framework
from google.cloud import firestore
from google.events.cloud import firestore as firestoredata
import datetime

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.DEBUG)

log = logging.getLogger("exams")
log.setLevel(logging.DEBUG)

@functions_framework.cloud_event
def examGradeScoreUpdate(cloud_event: CloudEvent):
    firestore_payload = firestore.DocumentEventData()
    firestore_payload._pb.ParseFromString(cloud_event.data)

    path_parts = firestore_payload.value.name.split("/")
    separator_idx = path_parts.index("documents")
    collection_path = path_parts[separator_idx + 1]
    document_path = "/".join(path_parts[(separator_idx + 2) :])

    print(f"Collection path: {collection_path}")
    print(f"Document path: {document_path}")

    resource_arr = collection_path
    documentId = document_path
    log.debug("*** documentId:" + documentId)  

    db = firestore.Client()
    closeExamGrade(db, documentId)

def closeExamGrade(db, documentId):  
    
    doc_ref = db.collection(u'examGrades').document(documentId)

    exam = doc_ref.get().to_dict()

    dateNow = datetime.datetime.now()    

    parameters_arr = doc_ref.collection("parameterGrades").get()

    
    if len(parameters_arr) > 0 :
        isCompleted = True
        total = 0.0
        numScores = 0
        for parameter in parameters_arr:
            p = parameter.to_dict()
            if p["isCurrentVersion"] == True:
                if p["isCompleted"] == True:
                    total = total + p["score"]
                    numScores += 1
                else:
                    isCompleted = False
                    break



        if numScores>0:
            if exam["isCompleted"] != isCompleted:
                if isCompleted == True: 
                    grade = total / numScores
                    isApproved = False
                    if grade>= 7:
                        isApproved = True


                    doc_ref.update({
                        u'score': grade,
                        u'isCompleted': True,
                        u'isApproved':isApproved,
                        u'updated_on': dateNow
                    })
                    log.debug("*** documentId:" + documentId + " completed")  
                else:
                    doc_ref.update({
                        u'score':0,
                        u'isCompleted':False,
                        u'isApproved':False,
                        u'isReleased':False,
                        u'updated_on': dateNow
                    })     
                    log.debug("*** documentId:" + documentId + " reopen")
        else:
            doc_ref.update({
                u'score':0,
                u'isCompleted':False,
                u'isApproved':False,
                u'isReleased':False,
                u'updated_on': dateNow
            })     
            log.debug("*** documentId:" + documentId + " reopen")    
    elif exam["isCompleted"] == True: #the exam does not have any parameters and has been marked as terminated 
        doc_ref.update({
            u'score':0,
            u'isCompleted':False,
            u'isApproved':False,
            u'isReleased':False,
            u'updated_on': dateNow
        })     
        log.debug("*** documentId:" + documentId + " reopen")               


    
