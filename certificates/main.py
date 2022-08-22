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
    organization_id = examGrade["organization_id"]
 
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
            #if found then count it
            if "isRequired" in exam and exam["isRequired"]:  
                requiredReleased +=1 
                break
            else:
                optionalReleased +=1
                break
    #if all has been passed generate the cerfificate
    log.debug("*** requiredCount:" + str(requiredCount) + " == requiredReleased:" + str(requiredReleased))
    log.debug("*** optionalCount:" + str(optionalCount) + " > optionalReleased:" + str(optionalReleased))
    if requiredCount == requiredReleased and (
        optionalCount == 0 or optionalReleased > 0):
        
        storage_client = storage.Client()

        materiaEnrollmentSet = db.collection("materiaEnrollments") \
            .where( "materia_id" , "==", materia_id) \
            .where( "student_uid", "==", student.uid) \
            .where( "isDeleted", "==", False) \
            .where( "organization_id", "==", organization_id).get()
            
        materiaEnrollmentRef = None
        for materiaEnrollmentDoc in materiaEnrollmentSet:
            materiaEnrollmentRef = materiaEnrollmentDoc

        materiaEnrollment = materiaEnrollmentRef.to_dict()

        certificateId =  student.uid + "_" + materia["id"] 

        certificateTypeRef = db.collection("organizations/" + organization_id + "/certificateTypes").document(materia["certificateTypeId"]).get()
        certificateType = certificateTypeRef.to_dict()

        masterName = certificateType["certificateTypePath"]
        logoName =  materia["materiaIconPath"]
        studentName = displayName
        materiaName = materia["materia_name"]
        label1 = certificateType["label1"]
        if certificateType["label2"] == "{materia_name}": 
            label2 = materia["materia_name"]
        else:
            label2 = certificateType["label2"] 
        label3 = certificateType["label3"]
        label4 = certificateType["label4"]
        color1 =  certificateType["color1"] 
        color2 =  certificateType["color2"]


        data = certificates.createStorageCertificate( storage_client, 
         masterName,
         logoName,
        "organizations/" + materia["organization_id"] + "/materiaEnrollments/" + materiaEnrollment["id"] +  "/" + certificateId + "_" + str( uuid.uuid4() ),
        studentName,
        materiaName,
        label1,
        label2,
        label3,
        label4,
        color1,
        color2
        )  
        
        json = {
            "certificatePath":data["certificatePath"],
            "certificateUrl": data["certificateUrl"],
            "certificateBadgePath":data["certificateBadgePath"],
            "certificateBadgeUrl": data["certificateBadgeUrl"] 

        }

        materiaEnrollmentRef.reference.update(json)
        log.debug("*** certificate generated :" + data["certificateUrl"])
    else:
        materiaEnrollmentsSet = db.collection("materiaEnrollments") \
            .where("materia_id","==", materia_id) \
            .where("student_uid","==", student.uid) \
            .get()
           

        for materiaEnromentDoc in materiaEnrollmentsSet:
            materiaEnrollment = materiaEnromentDoc.to_dict()            
            deleteCertificateMaterialEnrollment(materiaEnrollment["id"])  

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
        organization_id = materiaEnrollment["organization_id"]
        student_uid = materiaEnrollment["student_uid"]
        materia_id = materiaEnrollment["materia_id"]
        materiaRef = db.collection("materias").document(materia_id).get()
        materia = materiaRef.to_dict()
    

        student = auth.get_user(student_uid)
        if "displayName" in student.custom_claims:
            displayName = student.custom_claims["displayName"]
        elif student.display_name:
            displayName = student.display_name
        else: displayName = student.email


        certificateId =  student.uid + "_" + materia["id"] 

        certificateTypeRef = db.collection("organizations/" + organization_id + "/certificateTypes").document(materia["certificateTypeId"]).get()
        certificateType = certificateTypeRef.to_dict()

        masterName = certificateType["certificateTypePath"]
        logoName =  materia["materiaIconPath"]
        studentName = displayName
        materiaName = materia["materia_name"]
        label1 = certificateType["label1"]
        if certificateType["label2"] == "{materia_name}": 
            label2 = materia["materia_name"]
        else:
            label2 = certificateType["label2"]    
        label3 = certificateType["label3"]
        label4 = certificateType["label4"]
        color1 =  certificateType["color1"] 
        color2 =  certificateType["color2"]


        data = certificates.createStorageCertificate( storage_client, 
         masterName,
         logoName,
        "organizations/" + materia["organization_id"] + "/materiaEnrollments/" + materiaEnrollment_id +  "/" + certificateId + "_" + str( uuid.uuid4() ),
        studentName,
        materiaName,
        label1,
        label2,
        label3,
        label4,
        color1,
        color2
        )  
        
        json = {
            "certificatePath":data["certificatePath"],
            "certificateUrl": data["certificateUrl"],
            "certificateBadgePath":data["certificateBadgePath"],
            "certificateBadgeUrl": data["certificateBadgeUrl"] 

        }

        materiaEnrollmentRef.reference.update(json)
        return json       
            
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


        certificatePath = materiaEnrollment["certificatePath"]
        certificateBadgePath = materiaEnrollment["certificateBadgePath"]


        bucket_name = storage_client.project + ".appspot.com"
    
        bucket = storage_client.bucket(bucket_name)
        

        json ={
                "certificatePath":None,
                "certificateUrl":None,
                "certificateBadgePath":None,
                "certificateBadgeUrl":None
            }
        materiaEnrollmentDoc.reference.update(json)
        try:
            blob = bucket.blob(certificatePath)
            blob.delete()
            blobBadge = bucket.blob(certificateBadgePath)
            blobBadge.delete()
        except:
            log.warn("files not found")    

        log.debug("*** certificate removido" ) 
        return json


    

    
