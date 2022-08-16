import logging
from google.cloud import firestore
logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.DEBUG)

log = logging.getLogger("exams")
log.setLevel(logging.DEBUG)


def onMateriaEnrollmentUpdate(event, context):
    """Triggered by a change to a Firestore document.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    resource_string = context.resource
    # print out the resource string that triggered the function
    log.debug(f"*** Function triggered by change to: {resource_string}.")
    # now print out the entire event object
    log.debug("*** event:" + str(event))
    log.debug("*** context:" + str(context))
    resource_arr = resource_string.split("/")
    documentId = resource_arr[6]
    log.debug("*** documentId:" + documentId)  

    db = firestore.Client()
    materiaEnrollmentUpdate(db, documentId)

def materiaEnrollmentUpdate(db, documentId):  
    materiaEnrollmentDoc = db.collection(u'materiaEnrollments').document(documentId).get()
    materiaEnrollment = materiaEnrollmentDoc.to_dict()
    student_uid = materiaEnrollment["student_uid"]
    organization_id = materiaEnrollment["organization_id"]


    careers = db.collection(u'careers') \
        .where("isDeleted","==", False) \
        .where("organization_id", "==", organization_id ).get()
    for careerDoc in careers:
        materias_count = 0
        materias_passed = 0
        materias_enrolled = 0        
        career = careerDoc.to_dict()

        id = organization_id + "-" + career["id"] + "-" + student_uid
        careerAdvance = {
            "id":id,
            "organization_id":organization_id,
            "career_id":career["id"],
            "student_uid":student_uid,
        }
        db.collection("careerAdvance").document(id).set(careerAdvance)
        levels = careerDoc.reference.collection("levels")\
                .where("isDeleted", "==", False) \
                .get()        
        for levelDoc in levels:
            level_materias_count = 0
            level_materias_passed = 0
            level_materias_enrolled = 0
            level = levelDoc.to_dict()
            db.collection("careerAdvance/" + id + "/levels" ).document(level["id"]).set({ "id":level["id"]})
            groups = levelDoc.reference.collection("groups")\
                .where("isDeleted", "==", False) \
                .get()
            for groupDoc in groups:
                group = groupDoc.to_dict()
                group_materias_count = 0
                group_materias_passed = 0 
                group_materias_enrolled = 0
                group_passed = False
                db.collection("careerAdvance/" + id + "/levels/" + level["id"] + "/groups" ).document(group["id"]).set({ "id":group["id"]})

                materias = groupDoc.reference.collection("materias") \
                .get()
                for materiaDoc in materias:
                    materia = materiaDoc.to_dict()
                    materias_count += 1
                    level_materias_count += 1
                    group_materias_count +=1
                    enrollments = db.collection("materiaEnrollments") \
                        .where("materia_id", "==", materia["id"]) \
                        .where("student_uid", "==", student_uid) \
                        .where("organization_id", "==", organization_id) \
                        .where("isDeleted","==", False) \
                        .get()
                    for materiaEnrollmentDoc in enrollments:
                        materias_enrolled += 1
                        level_materias_enrolled += 1
                        group_materias_enrolled += 1
                        materiaEnrollment = materiaEnrollmentDoc.to_dict()
                        if materiaEnrollment["certificate_public_url"] != None:
                            materias_passed += 1
                            level_materias_passed += 1
                            group_materias_passed += 1
                group_grade_type_id = group["group_grade_type_id"] if "group_grade_type_id" in group else 0
                if group_grade_type_id == 0:
                    if group_materias_count == group_materias_passed:
                        group_passed = True
                elif group_materias_passed >= group_grade_type_id:
                    group_passed = True
                groupUpdate = {
                    "group_grade_type_id":group_grade_type_id,
                    "group_materias_count":group_materias_count,
                    "group_materias_passed":group_materias_passed,
                    "group_materias_enrolled":group_materias_enrolled,
                    "group_passed":group_passed                  
                }
                db.collection("careerAdvance/" + id + "/levels/" + level["id"] + "/groups" ).document(group["id"]).update(groupUpdate)
            log.debug("level:" + level["level_name"] + " level_materia_count:" + str(level_materias_count) + " level_materias_enrolled:" + str(level_materias_enrolled) + " level_materias_passed:" + str(level_materias_passed))
            levelGrade ={
                "level_materias_count":level_materias_count,
                "level_materias_passed":level_materias_passed,
                "level_materias_enrolled":level_materias_enrolled               
            }
            db.collection("careerAdvance/" + id + "/levels" ).document(level["id"]).update(levelGrade)

        log.debug("carrer:" + career["career_name"] + " materias_count:" + str(materias_count) + " materias_passed:" + str(materias_passed) + " materias_enrolled:" + str(materias_enrolled) )
        advance = {
            "materias_count":materias_count,
            "materias_passed":materias_passed,
            "materias_enrolled":materias_enrolled
        }
        db.collection("careerAdvance").document(id).update(advance)
                            






