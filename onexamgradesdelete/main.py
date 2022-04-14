
from google.cloud import firestore

def onExamGradesParameterDelete(event, context):
    """Triggered by a change to a Firestore document.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    resource_string = context.resource
    # print out the resource string that triggered the function
    print(f"Function triggered by change to: {resource_string}.")
    # now print out the entire event object
    print("event:" + str(event))
    print("context:" + str(context))
    resource_arr = resource_string.split("/")
    documentId = resource_arr[6]
    print("documentId:" + documentId)  

    db = firestore.Client()
    onDeleteExamGrade(db, documentId)

def onDeleteExamGrade(db, documentId):  
    doc_ref = db.collection(u'examGrades').document(documentId)
    parameters_arr = doc_ref.collection("parameterGrades").get()
    if len(parameters_arr) == 0 :
        doc_ref.delete()          
    
