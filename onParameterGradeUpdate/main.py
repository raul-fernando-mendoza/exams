import logging
from google.cloud import firestore
import datetime

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
                    if grade> 7:
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


    
