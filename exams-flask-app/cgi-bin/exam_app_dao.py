import sys
import datetime
import json
import logging

from db import Session
from models import Producto, TipoExamen, Maestro, Estudiante, Examen, ExamenObservaciones, RazonesSeleccionadas, OtrasRazonesSeleccionadas, MovimientosCancelados, ExamenTotales, User, Role, Token
from exam_models import *
from exam_impro_model import *
import json
import uuid
from datetime import datetime  
from datetime import timedelta
from flask_json import FlaskJSON, JsonError, json_response, as_json


def apiProcess(data):

        logging.debug( "apiProcess:" + str(data)  )
        if data['what'] == 'getExamenesPendientes':
            user_id = data['user_id']
            return getExamenesPendientes(user_id)
        elif data['what'] == 'SaveExamen':
            return SaveExamen(data)
        elif data['what'] == 'GetExamen':
            return getExamen(data)
        elif data["what"] == "loginUser":
            return loginUser(data)
        elif data["what"] == "getExamApplication":
            application_id = data['application_id']
            return getExamApplication(application_id)            
        elif data["what"] == "getExamType":
            type_id = data['type_id']
            return getExamType(type_id)            
        elif data["what"] == "getExamImproType":
            type_id = data['id']
            return getExamImproType(type_id)            
        elif data["what"] == "getExamImproApplication":
            id = data['id']
            return getExamImproApplication(id)  
        elif data["what"] == "addExamImproApplication":
            exam_impr_type_id = data['exam_impr_type_id']  
            estudiante_id = data['estudiante_id'] 
            fechaApplicacion = data['fechaApplicacion']      
            return addExamImproApplication(exam_impr_type_id,estudiante_id,fechaApplicacion) 
        elif data["what"] == "updateExamImproApplicationParameter":
            exam_impro_application_id = data["exam_impro_application_id"]
            exam_impro_parameter_id = data["exam_impro_parameter_id"]
            maestro_id = data["maestro_id"]
            completado = data["completado"]
            return updateExamImproApplicationParameter(exam_impro_application_id, exam_impro_parameter_id, maestro_id, completado)
        elif data["what"] == "addExamImproApplicationRemovedQuestion":
            exam_impro_application_parameter_id = data["exam_impro_application_parameter_id"]
            exam_impro_question_id = data["exam_impro_question_id"]
            return addExamImproApplicationRemovedQuestion(exam_impro_application_parameter_id, exam_impro_question_id)            
        elif data["what"] == "deleteExamImproApplicationRemovedQuestion":
            exam_impro_application_parameter_id = data["exam_impro_application_parameter_id"]
            exam_impro_question_id = data["exam_impro_question_id"]
            return deleteExamImproApplicationRemovedQuestion(exam_impro_application_parameter_id, exam_impro_question_id)            
        elif data["what"] == "updateExamImproApplicationGradedQuestion":
            exam_impro_application_parameter_id = data["exam_impro_application_parameter_id"]
            exam_impro_question_id = data["exam_impro_question_id"]
            grade = data["grade"]        
            return updateExamImproApplicationGradedQuestion(exam_impro_application_parameter_id, exam_impro_question_id, grade)
        elif data["what"] == "getExamImproApplicationParameter":
            maestro_id = data["maestro_id"]
            completado = data["completado"]
            return getExamImproApplicationParameter(maestro_id, completado)
        elif data["what"] == "searchExamImproApplication":
            estudiante_id = data["estudiante_id"]
            maestro_id = data["maestro_id"]
            completado = data["completado"]
            parameter_completado =  data["parameter_completado"]
            return searchExamImproApplication(estudiante_id, maestro_id, completado, parameter_completado)
        else:
            raise NameError("solicitud invalida")


#curl -X POST --data '{"what": "getExamenesPendientes", "user_id":"raul"}' http://localhost:80/api/exam_app_ent.py/requestapi
#curl -X POST -H "Content-Type: application/json" -d @/var/www/cgi-bin/examen_observaciones.json http://127.0.0.1:5000/requestapi
def getExamenesPendientes(user_id):
    logging.debug( "getExamenesPendientes:" + str(user_id)  )

    session = Session()
    try:
        examenes = session.query(Examen).filter_by(maestro_id=user_id).all()
        print("results:" + str(examenes) )
        result = []
        for exam in examenes:
            o = {
                "id": exam.id,
                "label": exam.tipoExamen.label,
                "studentName":exam.estudiante.nombre,
                "teacherName":exam.maestro.nombre,
                "grade": exam.grado,
                "completado": exam.completado,
                "applicationDate": exam.fechaApplicacion.strftime("%Y/%m/%d %H:%M:%S")
                }
            result.append(o)
        logging.debug( result )
        return result
    except Exception as e:
        session.rollback()
        raise JsonError(description="Exception:" + str(e))        
#update else insert ExamenObservaciones

def SaveExamen(data): 
    logging.debug("SaveExamen called")
    session = Session()
    try:
        entities = data['entities']
        logging.debug("entities:" + str(entities))
        
        exam_id=entities["id"]
        logging.debug("exam_id:" + str(exam_id))
        examen = None
        if id:
            logging.debug("retriving from database") 
            examen = session.query(Examen).filter_by(id=exam_id).first()

        #logging.debug("examen_object:" + str(examen) )

        if not examen :
            raise Exception("Invalid exam number")

        

        examen.examen_observaciones.clear()         
        observaciones = entities['examen_observaciones']
        logging.debug("examen_observaciones:" + str(observaciones))
        for o in observaciones:
            logging.debug("o:" + str(o))
            n = ExamenObservaciones(
                examen_id=o['examen_id'],
                exercise_id=o['exercise_id'],
                row_id=o['row_id'],
                col_id=o['col_id'],
                is_selected=o['is_selected'])
            examen.examen_observaciones.append(n)

        examen.razones_seleccionadas.clear()
        razones_seleccionadas = entities['razones_seleccionadas']
        logging.debug("razones_seleccionadas:" + str(razones_seleccionadas))
        for o in razones_seleccionadas:
            logging.debug("r:" + str(o))
            
            n = RazonesSeleccionadas(
                        examen_id = o["examen_id"],
                        exercise_id = o["exercise_id"],
                        row_id=o["row_id"],
                        col_id=o["col_id"],
                        reason_id=o["reason_id"]
            )
            examen.razones_seleccionadas.append(n)

        examen.otras_razones_seleccionadas.clear()
        otras_razones_seleccionadas = entities['otras_razones_seleccionadas']
        logging.debug("otras_razones_seleccionadas:" + str(otras_razones_seleccionadas))
        
        for o in otras_razones_seleccionadas:
            n = OtrasRazonesSeleccionadas(
                examen_id=o['examen_id'],
                exercise_id=o['exercise_id'],
                row_id=o['row_id'],
                col_id=o['col_id'],
                otra_razon=o["otra_razon"])   
            examen.otras_razones_seleccionadas.append(n) 

        examen.movimientos_cancelados.clear()
        movimientos_cancelados = entities["movimientos_cancelados"]
        logging.debug("movimientos_cancelados" + str(movimientos_cancelados))

        for o in movimientos_cancelados:
            n=MovimientosCancelados(
                examen_id = o["examen_id"],
                exercise_id = o["exercise_id"],
                row_id = o["row_id"]
            )
            examen.movimientos_cancelados.append(n)

        examen.examen_totales.clear()
        examen_totales = entities["examen_totales"]
        logging.debug("examen_totales" + str(examen_totales))

        for o in examen_totales:
            n=ExamenTotales(
                examen_id = o["examen_id"],
                exercise_id = o["exercise_id"],
                row_id = o["row_id"],
                row_total = o["row_total"]
            )
            examen.examen_totales.append(n)
        examen.completado = True
        session.commit()
    except Exception as e:
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()
    return "OK"

def getExamen(data):
    logging.debug("getExamen called")
    entities = data['entities']
    #logging.debug("entities:" + str(entities))
    
    exam_id=entities["id"]
    logging.debug("exam_id:" + str(exam_id))
    examen = None
    result = None

    session = Session()


    try:
        if id:
            logging.debug("retriving from database") 
            examen = session.query(Examen).filter_by(id=exam_id).first()

        #logging.debug("examen_object:" + str(examen) )

        if not examen :
            raise NameError("Examen Invalido")

        result = examen.toJSON()
    except Exception as e:
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result


def loginUser(data): 
    logging.debug("login user called")
    entities = data['entities']
    logging.debug("entities:" + str(entities))
    
    user_name=entities["user_name"]
    password=entities["password"]
    logging.debug("user_name:" + str(user_name) )
 
    session = Session()
    try:
        user = session.query(User).filter_by(user_name=user_name).first()
        logging.debug("user:" + str(user))

        if user and user.password ==  password:
            logging.debug("passwords are the same")
            #create a new key
            key = str(uuid.uuid4())
            t = datetime.now() + timedelta(days=1) 
            token = Token(key, t, user.user_id)
            session.add(token)
            session.commit()

            roles = []
            for r in user.roles:
                n = {
                    "role": r.role_name
                }
                roles.append(n)
            
            obj= {
                "token":key,
                "user_id":user.user_id,
                "roles":roles
            }
            return obj
        else:
            logging.warn("password invalido for:" + user_name) 
            raise NameError("Usuario invalido")   
    except Exception as e:
        logging.error("Exception occurred:" + str(e))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))            
    finally:
        session.close()

#curl -X POST --data '{"what": "getObservacion", "tipo_examen_id":"1"}' http://localhost:80/flask/exam_app/requestapi
def getExamApplication(application_id):
    logging.debug( "getExam:" + str(application_id)  )

    session = Session()
    try:
        exam_application = session.query(ExamApplication).filter_by(application_id=application_id).first()

        return exam_application.toJSON()
    except Exception as e:
        logging.error("Exception:" + str(e))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))        
    finally:
        session.close()


def getExamType(type_id):
    logging.debug("getExamType called")   
    logging.debug("type_id:" + str(type_id))
    
    result = None

    session = Session()
    try:
        examen_type = None
        logging.debug("retriving from database:" + str(type_id)) 
        examen_type = session.query(ExamType).filter_by(type_id=type_id).first()

        #logging.debug("examen_object:" + str(examen) )

        if not examen_type :
            raise NameError("examen_type Invalido")

        result = examen_type.toJSON()
    except Exception as e:
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result


def getExamImproType(id):
    logging.debug("getExamImproType called")   
    logging.debug("id:" + str(id))
    
    result = None

    session = Session()
    try:
        exam_impro_type = None
        logging.debug("retriving from database:" + str(id)) 
        qry = session.query(ExamImproType)
        
        if id != "":
            exam_impro_type = qry.filter_by(id=id).first()
            result = exam_impro_type.toJSON()
        else:
            exam_impro_type = qry.all()
            result = []
            for e in exam_impro_type:
                result.append(e.toJSON())
        
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def getExamImproApplication(id):
    logging.debug("getExamImproApplication called")   
    logging.debug("id:" + str(id))
    
    result = None

    session = Session()
    try:
        logging.debug("retriving from database:" + str(id)) 
        obj = session.query(ExamImproApplication).filter_by(id=id).first()

        #logging.debug("examen_object:" + str(examen) )

        if not obj :
            raise NameError("exam_impro_application Invalido")

        result = obj.toJSON()
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()        
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def searchExamImproApplication(estudiante_id, maestro_id, completado, parameter_completado):
    logging.debug("searchExamImproApplication called")   
    logging.debug("estudiante_id:%s maestro_id:%s completado:%s parameter_completado:%s", str(estudiante_id) , str(maestro_id), str(completado), str(parameter_completado))
    
    result = []

    session = Session()
    try:
        logging.debug("retriving from database:") 

        query = session.query(ExamImproApplication).join(ExamImproApplicationParameter)

        if estudiante_id != "":
            query = query.filter( ExamImproApplication.estudiante_id == estudiante_id )
        if completado != "":
            query = query.filter( ExamImproApplication.completado == completado )
        if maestro_id != "":
            query = query.filter(ExamImproApplicationParameter.maestro_id==maestro_id)
        if parameter_completado != "":
            query = query.filter( ExamImproApplicationParameter.completado == parameter_completado)

        obj = query.all()

        for o in obj:
            result.append(o.toJSON())

    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()        
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def addExamImproApplication(exam_impro_type_id, estudiante_id, fechaApplicacion):
    logging.debug("addExamImproApplication called")   
    logging.debug("exam_impro_type_id:" + str(exam_impro_type_id))
    
    result = None

    session = Session()
    try:
        logging.debug("retriving from database:" + str(exam_impro_type_id)) 
        exam_impro_type = session.query(ExamImproType).filter_by(id=exam_impro_type_id).first()



        #logging.debug("examen_object:" + str(examen) )

        if not exam_impro_type :
            raise NameError("exam_impro_application Invalido")


        ea = ExamImproApplication(None, exam_impro_type_id, estudiante_id, fechaApplicacion , False)
        session.add( ea )
        session.flush()

        parameters = exam_impro_type.parameters

        for p in parameters:
            session.add( ExamImproApplicationParameter(id=None, exam_impro_application_id=ea.id, exam_impro_parameter_id=p.id, maestro_id=None, completado=False) )

        session.commit()
        ea = session.query(ExamImproApplication).filter_by(id=ea.id).first()

        result = ea.toJSON()
        
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result


def updateExamImproApplicationParameter(exam_impro_application_id, exam_impro_parameter_id, maestro_id, completado):
    logging.debug("updateExamImproApplicationParameter called")   
    logging.debug("%s %s %s %s" , str(exam_impro_application_id) , str(exam_impro_parameter_id), str(maestro_id), str(completado))
    
    result = None

    session = Session()
    try:
        logging.debug("retriving from database:") 
        applicationParameter = session.query(ExamImproApplicationParameter).filter_by(exam_impro_application_id=exam_impro_application_id,exam_impro_parameter_id=exam_impro_parameter_id ).first()

        if not applicationParameter :
            raise NameError("ExamImproApplicationParameter Invalido")

        if maestro_id:
            applicationParameter.maestro_id = maestro_id

        if completado != "":
            applicationParameter.completado = completado
            

        session.commit()
    

        result = applicationParameter.toJSON()
        
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def getExamImproApplicationParameter(maestro_id, completado):
    logging.debug("getExamImproApplicationParameter called")   
    logging.debug("%s %s" , str(maestro_id), str(completado))
    
    result = []

    session = Session()
    try:
        logging.debug("retriving from database:") 
        applicationParameter = session.query(ExamImproApplicationParameter).filter_by(maestro_id=maestro_id,completado=completado ).all()

        arr = []
        for ap in applicationParameter:
            arr.append(ap.toJSON())
        
        result = arr
        
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def addExamImproApplicationRemovedQuestion(exam_impro_application_parameter_id, exam_impro_question_id):
    logging.debug("addExamImproApplicationRemovedQuestion called")   
    logging.debug("exam_impro_application_parameter_id:%s exam_impro_question_id:%s" , str(exam_impro_application_parameter_id) , str(exam_impro_question_id))
    
    result = None

    session = Session()
    try:
        rq = ExamImproApplicationRemovedQuestion(exam_impro_application_parameter_id, exam_impro_question_id)
        session.add( rq )
        session.flush()

        session.commit()

        result = rq.toJSON()
        
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def deleteExamImproApplicationRemovedQuestion(exam_impro_application_parameter_id, exam_impro_question_id):
    logging.debug("deleteExamImproApplicationRemovedQuestion called")   
    logging.debug("exam_impro_application_parameter_id:%s exam_impro_question_id:%s" , str(exam_impro_application_parameter_id) , str(exam_impro_question_id))
    
    result = None

    session = Session()
    try:
        rq = session.query(ExamImproApplicationRemovedQuestion).filter_by(exam_impro_application_parameter_id=exam_impro_application_parameter_id, exam_impro_question_id=exam_impro_question_id).first() 
        session.delete( rq )
        session.flush()

        session.commit()

        result = rq.toJSON()
        
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def updateExamImproApplicationGradedQuestion(exam_impro_application_parameter_id, exam_impro_question_id, grade):
    logging.debug("updateExamImproApplicationGradedQuestion called")   
    logging.debug("exam_impro_application_parameter_id:%s exam_impro_question_id:%s grade:%s" , str(exam_impro_application_parameter_id) , str(exam_impro_question_id), str(grade))
    
    result = None

    session = Session()
    try:
        q = session.query(ExamImproApplicationGradedQuestion).filter_by(exam_impro_application_parameter_id=exam_impro_application_parameter_id, exam_impro_question_id=exam_impro_question_id).first() 
        if q :
            q.grade = grade
            session.commit()
        else:
            q = ExamImproApplicationGradedQuestion( exam_impro_application_parameter_id=exam_impro_application_parameter_id, exam_impro_question_id=exam_impro_question_id,grade=grade)
            session.add( q )
            session.commit()
        result = q.toJSON()
        
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

def getEstudiante(id):
    logging.debug("getEstudiante called")
    
    session = Session()


    try:
        if id:
            logging.debug("retriving from database") 
            qry = session.query(Estudiante)
            if id != "":
                estudiante = session.query(Estudiante).filter_by(id=exam_id).first()
                result = estudiante.toJSON()
            else:
                estudianteList = session.query(Estudiante).all()
                result = []
                for e in estudianteList:
                    result.append(e.toJSON())
    except Exception as e:
        logging.error("Exception:" + str(e.msg))
        session.rollback()
        raise JsonError(description="Exception:" + str(e))
    finally:
        session.close()    
    return result

if __name__ == '__main__':
    # create this model.
    print("exam_app_dao")     