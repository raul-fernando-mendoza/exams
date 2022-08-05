import logging
from google.cloud import firestore

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.DEBUG)

log = logging.getLogger("exams")
log.setLevel(logging.DEBUG)

def examGradeScoreUpdate(event, context):
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
    parameters_arr = doc_ref.collection("parameterGrades").get()

    
    if len(parameters_arr) > 0 :
        isCompleted = True
        total = 0.0
        numScores = 0
        for parameter in parameters_arr:
            p = parameter.to_dict()
            if p["isCompleted"] == True:
                total = total + p["score"]
                numScores += 1
            else:
                isCompleted = False
                break
        if isCompleted == True: 
            grade = total / numScores
            isApproved = False
            if grade> 7:
                isApproved = True

            doc_ref.update({
                u'score': grade,
                u'isCompleted': True,
                u'isApproved':isApproved
            })


    