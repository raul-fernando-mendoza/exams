#gcloud functions deploy examgradesparameterupdate --region=us-central1 --entry-point examgradesparameterupdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/celtic-bivouac-307316/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" 
from google.cloud import firestore
from google.cloud import storage
from certificates import createStorageCertificate
import logging



logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)

log = logging.getLogger("exams")
log.setLevel(logging.ERROR)

def examgradesparameterupdate(event, context):
    """Triggered by a change to a Firestore document.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    resource_string = context.resource
    # print out the resource string that triggered the function
    log.debug("*** Function triggered by change to: {resource_string}.")
    # now print out the entire event object
    log.debug("*** event:" + str(event))
    log.debug("*** context:" + str(context))
    resource_arr = resource_string.split("/")
    documentId = resource_arr[6]
    log.debug("*** documentId:" + documentId)  

    db = firestore.Client()
    closeExamGrade(db, documentId)

def closeExamGrade(db, documentId):  
    
    doc_ref = db.collection(u'examGrades').document(documentId)
    examGrade = doc_ref.get().to_dict()  

    parameters_arr = doc_ref.collection("parameterGrades").get()

    
    if len(parameters_arr) > 0 :
        isCompleted = True
        total = 0.0
        for parameter in parameters_arr:
            p = parameter.to_dict()
            if p["completed"] == True:
                total = total + p["score"]
            else:
                isCompleted = False
                break
        if isCompleted == True:
            grade = total / len(parameters_arr)
            url = None
            if grade >= 7:
                storage_client = storage.Client()
                url = createStorageCertificate(storage_client, examGrade["id"] + ".jpg",examGrade["student_name"],examGrade["exam_label"])   
            doc_ref.update({
                u'score': grade,
                u'completed': True,
                u"certificate_url":url
            })             
    
