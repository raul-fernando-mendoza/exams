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

def createCertificateOnExamGradeEvent(event, context):
    """Triggered by a change to a Firestore document.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    resource_string = context.resource
    # print out the resource string that triggered the function
    log.debug("*** Function triggered by change to:" + resource_string)
    # now print out the entire event object
    log.debug("*** event:" + str(event))
    log.debug("*** context:" + str(context))
    resource_arr = resource_string.split("/")
    documentId = resource_arr[6]
    log.debug("*** documentId:" + documentId)  

    db = firestore.Client()
    createCertificateExamGrade(db, documentId)

def createCertificateExamGrade(db, examGrade_id):  
    
    examGrade = db.collection(u'examGrades').document(examGrade_id).get().to_dict()

    materia_id = examGrade["materia_id"]
 
    #exam = db.collection("exams").document(examGrade["exam_id"]).get().to_dict()
    materia = db.collection("materias").document(materia_id).get().to_dict()
    #find all exams for materia
    examSet = db.collection("materias/" + materia_id + "/exams") \
    .where("isDeleted","==",False) \
    .get() 

    requiredCount = 0
    requiredReleased = 0
    optionalCount = 0
    optionalReleased = 0

    student = auth.get_user(examGrade["student_uid"])
    displayName = student.custom_claims["displayName"] if ("displayName" in student.custom_claims) else student.email


    for examDoc in examSet:
        exam = examDoc.to_dict()
        if "isRequired" in exam and exam["isRequired"]:
            requiredCount += 1
        else: optionalCount += 1

        examGradeSet = db.collection("examGrades") \
            .where("materia_id", "==", materia_id) \
            .where("exam_id", "==", examDoc.get("id")) \
            .where("student_uid","==", student.uid) \
            .where("isDeleted","==", False) \
            .where("isCompleted","==", True) \
            .where("isReleased","==",True) \
            .where("isApproved","==",True) \
            .get()
        for examGradeDoc in examGradeSet:
            examGrade = examGradeDoc.to_dict()
            if "isRequired" in exam and exam["isRequired"]:  
                requiredReleased +=1 
                break
            else:
                optionalReleased +=1
                break
    #if all has been passed generate the cerfificate
    log.debug("*** requiredCount:" + str(requiredCount) + " == requiredReleased:" + str(requiredReleased))
    log.debug("*** optionalCount:" + str(requiredCount) + " > optionalReleased:" + str(requiredReleased))
    if requiredCount == requiredReleased and (
        optionalCount == 0 or optionalReleased > 0):
        
        storage_client = storage.Client()

        certificateId =  student.uid + "_" + materia["id"] 
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
            .where("materia_id","==", materia_id) \
            .where("student_uid","==", student.uid) \
            .where("isDeleted","==",False) \
            .get()

        for materiaEnromentDoc in materiaEnrollmentsSet:
            materiaEnromentDoc.reference.update({
                "certificate_name":data["certificate_name"],
                "certificate_public_url":data["certificate_public_url"] 
            })
        log.debug("*** certificate generated :" + data["certificate_public_url"])
    else:
        materiaEnrollmentsSet = db.collection("materiaEnrollments") \
            .where("materia_id","==", materia_id) \
            .where("student_uid","==", student.uid) \
            .get()

        for materiaEnromentDoc in materiaEnrollmentsSet:
            materiaEnromentDoc.reference.update({
                "certificate_name":None,
                "certificate_public_url": None 
            })  

        log.debug("*** certificate removido :" )     

            
#********************************* URL ************************
def createCertificateMateriaEnrollmentPost(request):
    log.error("**** create certificates receive:" + str(request))
    log.error("**** create certificates type:" + str(type(request)))
    log.error("**** create certificates method:" + str(request.method))
    log.error("**** create certificates content-type:" + str(request.content_type))
    log.error("**** create certificates mimetype:" + str(request.mimetype))    
    log.error("**** create certificates is_json:" + str(request.is_json))      
    log.error("**** create certificates get content_encoding:" + str(request.content_encoding))    
    log.error("**** create certificates get data:" + str(type(request.get_data())))
    log.error("**** create certificates decode:" + str(request.get_data().decode()))

    # For more information about CORS and CORS preflight requests, see:
    # https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    data = None
    try:
        obj = request.get_json(force=True, silent=False)
        if obj == None:
            log.error("***** request can not be read as json")
            raise Exception("json cannot be read")
        else:
            log.error("***** request was read as json")


        materiaEnrollment_id = obj["materiaEnrollment_id"]
        data = createCertificateMateriaEnrollment(materiaEnrollment_id)
    
    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 200, headers)
    return ({"result":data}, 200, headers)

def createCertificateMateriaEnrollment(materiaEnrollment_id):
        storage_client = storage.Client()
        db = firestore.Client()
        materiaEnrollmentRef = db.collection("materiaEnrollments").document(materiaEnrollment_id).get()      

        materiaEnrollment = materiaEnrollmentRef.to_dict()
        student_uid = materiaEnrollment["student_uid"]
        materia_id = materiaEnrollment["materia_id"]
        materiaRef = db.collection("materias").document(materia_id).get()
        materia = materiaRef.to_dict()
    

        student = auth.get_user(student_uid)
        displayName = student.custom_claims["displayName"] if ("displayName" in student.custom_claims ) else student.display_name 


        certificateId =  student.uid + "_" + materia["id"] 
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


        materiaEnrollmentRef.reference.update({
            "certificate_name":data["certificate_name"],
            "certificate_public_url": data["certificate_public_url"] 
        })
        return { 
            "certificate_name":data["certificate_name"],
            "certificate_public_url": data["certificate_public_url"] 
        }        
            
#*************************** delete certificate

def deleteCertificateMateriaEnrollmentPost(request):
    log.error("**** create certificates receive:" + str(request))
    log.error("**** create certificates type:" + str(type(request)))
    log.error("**** create certificates method:" + str(request.method))
    log.error("**** create certificates content-type:" + str(request.content_type))
    log.error("**** create certificates mimetype:" + str(request.mimetype))    
    log.error("**** create certificates is_json:" + str(request.is_json))      
    log.error("**** create certificates get content_encoding:" + str(request.content_encoding))    
    log.error("**** create certificates get data:" + str(type(request.get_data())))
    log.error("**** create certificates decode:" + str(request.get_data().decode()))

    # For more information about CORS and CORS preflight requests, see:
    # https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    data = None
    try:
        obj = request.get_json(force=True, silent=False)
        if obj == None:
            log.error("***** request can not be read as json")
            raise Exception("json cannot be read")
        else:
            log.error("***** request was read as json")


        materiaEnrollment_id = obj["materiaEnrollment_id"]
        data = deleteCertificateMaterialEnrollment(materiaEnrollment_id)
    
    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 200, headers)
    return ({"result":data}, 200, headers)

def deleteCertificateMaterialEnrollment(materiaEnrollment_id):
        storage_client = storage.Client()
        db = firestore.Client()
        materiaEnrollmentDoc = db.collection("materiaEnrollments").document( materiaEnrollment_id ).get()      

        materiaEnrollment = materiaEnrollmentDoc.to_dict()


        certificate_name = materiaEnrollment["certificate_name"]


        bucket_name = "certificates-" + storage_client.project 
    
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(certificate_name)
        blob.delete()

        materiaEnrollmentDoc.reference.update(
            {
                "certificate_name":None,
                "certificate_public_url":None
            }
        )

        log.debug("*** certificate removido" ) 
        return { 
            "certificate_name": certificate_name
        }


    

    
