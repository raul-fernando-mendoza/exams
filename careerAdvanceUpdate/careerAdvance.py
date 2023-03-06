import logging

log = logging.getLogger("careerAdvance")

def careerAdvanceUpdate(db, organizationId, careerId):
    #for each of the carrerAdvance record run the update
    careerAdvanceSet = db.collection(u'careerAdvance').where("career_id","==",careerId).get()
    for careerAdvanceDoc in careerAdvanceSet:
        careerAdvance = careerAdvanceDoc.to_dict()
        studentUid = careerAdvance["student_uid"]
        log.debug("updating for student:" + studentUid)
        careerAdvanceStudentUpdate(db, organizationId, careerId, studentUid)
    return "OK"



def careerAdvanceStudentUpdate(db, organizationId, careerId, studentUid):  

    careerDoc = db.collection(u'careers').document(careerId).get()

    career_materias_required = 0
    career_materias_approved = 0
    career_completed = False     
    career = careerDoc.to_dict()

    id = organizationId + "-" + career["id"] + "-" + studentUid
    careerAdvance = {
        "id":id,
        "organization_id":organizationId,
        "career_id":career["id"],
        "student_uid":studentUid
    }
    db.collection("careerAdvance").document(id).set(careerAdvance)
    levels = careerDoc.reference.collection("levels")\
            .where("isDeleted", "==", False) \
            .get()        
    for levelDoc in levels:
        level_materias_approved = 0
        level_materias_required = 0
        level_completed = False
        level = levelDoc.to_dict()
        db.collection("careerAdvance/" + id + "/levels" ).document(level["id"]).set({ "id":level["id"]})
        groups = levelDoc.reference.collection("groups")\
            .where("isDeleted", "==", False) \
            .get()
        for groupDoc in groups:
            group = groupDoc.to_dict()
            group_grade_type_id = group["group_grade_type_id"] if "group_grade_type_id" in group else 0

            group_materias_required = 0
            group_materias_approved = 0 

            if group_grade_type_id > 0 :
                career_materias_required += group_grade_type_id
                group_materias_required = group_grade_type_id

            group_completed = False
            db.collection("careerAdvance/" + id + "/levels/" + level["id"] + "/groups" ).document(group["id"]).set({ "id":group["id"]})

            materias = groupDoc.reference.collection("materias") \
            .get()
            for materiaDoc in materias:
                materia = materiaDoc.to_dict()

                if group_grade_type_id == 0:
                    career_materias_required += 1
                    level_materias_required += 1
                    group_materias_required +=1                        

                enrollments = db.collection("materiaEnrollments") \
                    .where("materia_id", "==", materia["id"]) \
                    .where("student_uid", "==", studentUid) \
                    .where("organization_id", "==", organizationId) \
                    .where("isDeleted","==", False) \
                    .get()
                for materiaEnrollmentDoc in enrollments:
                    materiaEnrollment = materiaEnrollmentDoc.to_dict()
                    if "certificateUrl" in materiaEnrollment and materiaEnrollment["certificateUrl"] != None:
                        if group_grade_type_id == 0 or group_materias_approved < group_grade_type_id:
                            career_materias_approved += 1
                            level_materias_approved += 1
                            group_materias_approved += 1                                
            
            if group_grade_type_id == 0:
                if group_materias_required == group_materias_approved:
                    group_completed = True
            elif group_materias_approved >= group_grade_type_id:
                group_completed = True
            groupUpdate = {
                "group_grade_type_id":group_grade_type_id,
                "group_materias_required":group_materias_required,
                "group_materias_approved":group_materias_approved,
                "group_completed":group_completed                  
            }
            log.debug("group:" + group["group_name"] + " group_materias_required:" + str(group_materias_required) + " group_materias_approved:" + str(group_materias_approved) + " group_completed:" + str(group_completed))
            db.collection("careerAdvance/" + id + "/levels/" + level["id"] + "/groups" ).document(group["id"]).update(groupUpdate)
        if level_materias_required == level_materias_approved:
            level_completed = True
        levelGrade ={
            "level_materias_required":level_materias_required,
            "level_materias_approved":level_materias_approved,
            "level_completed":level_completed               
        }
        log.debug("level:" + level["level_name"] + " level_materias_required:" + str(level_materias_required) + " level_materias_approved:" + str(level_materias_approved) + " level_completed:" + str(level_completed))
        db.collection("careerAdvance/" + id + "/levels" ).document(level["id"]).update(levelGrade)

    if career_materias_approved == career_materias_required:
        career_completed = True
    advance = {
        "career_materias_approved":career_materias_approved,
        "career_materias_required":career_materias_required,
        "career_completed":career_completed
    }
    log.debug("carrer:" + career["career_name"] + " career_materias_approved:" + str(career_materias_approved) + " career_materias_required:" + str(career_materias_required) + " career_completed:" + str(career_completed) )
    db.collection("careerAdvance").document(id).update(advance)

    return "OK"
