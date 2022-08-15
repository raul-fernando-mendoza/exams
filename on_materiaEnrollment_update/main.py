
from google.cloud import firestore

def onMateriaEnrollmentUpdate(event, context):
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
    onMateriaEnrollmentUpdate(db, documentId)

def onMateriaEnrollmentUpdate(db, documentId):  
    materiaEnrollmentDoc = db.collection(u'materiaEnrollments').document(documentId).get()
    materiaEnrollment = materiaEnrollmentDoc.to_dict()
    student_uid = materiaEnrollment["student_uid"]
    organization_id = materiaEnrollment["organization_id"]
    careers = db.collection(u'careers') \
        .where("isDeleted","==", False) \
        .where("organization_id", "==", organization_id ).get()
    for careerDoc in careers:
        career = careerDoc.to_dict()
        levels = careerDoc.reference.collection("levels")\
                .where("isDeleted", "==", False) \
                .get()
        for levelDoc in levels:
            level = levelDoc.to_dict()
            groups = levelDoc.reference.collection("groups")\
                .where("isDeleted", "==", False) \
                .get()
            for groupDoc in groups:
                group = groupDoc.to_dict()
                materias = groupDoc.reference.collection("materias") \
                .get()
                for materiaDoc in materias:
                    materia = materiaDoc.to_dict()




