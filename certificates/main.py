import logging
from google.cloud import firestore
from google.cloud import storage
from firebase_admin import auth
import certificates
import uuid
import firebase_admin
firebase_admin.initialize_app()

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.DEBUG)

log = logging.getLogger("exams")
log.setLevel(logging.DEBUG)

def generateMateriaCertificate(event, context):
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
    generateCertificate(db, documentId)

def generateCertificate(db, documentId):  
    
    examGrade = db.collection(u'examGrades').document(documentId).get().to_dict()
 
    exam = db.collection("exams").document(examGrade["exam_id"]).get().to_dict()

    #find all exams for materia
    examSet = db.collection("exams") \
    .where("isDeleted","==",False) \
    .where("materia_id","==",examGrade["materia_id"]) .get()  

    materia = db.collection("materias").document(examGrade["materia_id"]).get().to_dict()

    student = auth.get_user(examGrade["student_uid"])
    displayName = student.custom_claims["displayName"] if ("displayName" in student.custom_claims) else student.email

    materiaCompleted=True
    for examDoc in examSet:
        examGradeSet = db.collection("examGrades") \
            .where("materia_id", "==", materia["id"]) \
            .where("exam_id", "==", examDoc.get("id")) \
            .where("student_uid","==", student.uid) \
            .where("isDeleted","==", False) \
            .get()
        for examGradeDoc in examGradeSet:    
            if not(examGradeDoc.get("isCompleted") and examGradeDoc.get("isApproved") and examGradeDoc.get("isReleased")):
                materiaCompleted=False
    #if all has been passed generate the cerfificate
    if materiaCompleted:
        
        storage_client = storage.Client()

        certificateId =  student.uid + "_" + materia["id"] + str(uuid.uuid4())
        masterName = materia["typeCertificate"]
        logoName =  materia["iconCertificate"]
        studentName = displayName
        materiaName = materia["materia_name"]
        label1 = materia["label1"]
        label2 = materia["label2"]
        label3 = materia["label3"]
        label4 = materia["label4"]
        color1 =  materia["color1"] 
        color2 =  materia["color2"]


        data = certificates.createStorageCertificate( storage_client, 
        "certificates_master/" + masterName,
        "certificates_logos/" + logoName,
        "certificates/" + certificateId ,
         studentName,
        materiaName,
        label1,
        label2,
        label3,
        label4,
        color1,
        color2
        )  

        materiaEnrollmentsSet = db.collection("materiaEnrollments") \
            .where("materia_id","==", materia["id"]) \
            .where("student_id","==", student.uid) \
            .get()

        for materiaEnromentDoc in materiaEnrollmentsSet:
            materiaEnromentDoc.reference.update({
                "certificate_url": data["certificate_url"] 
            })
    else:
        materiaEnrollmentsSet = db.collection("materiaEnrollments") \
            .where("materia_id","==", materia["id"]) \
            .where("student_id","==", student.uid) \
            .get()

        for materiaEnromentDoc in materiaEnrollmentsSet:
            materiaEnromentDoc.reference.update({
                "certificate_url": None 
            })        

            

            



    

    
