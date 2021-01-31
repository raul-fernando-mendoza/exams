import sys
import datetime
import json
import logging

from db import Session
from models import Producto, TipoExamen, Maestro, Estudiante, Examen, ExamenObservaciones, RazonesSeleccionadas, OtrasRazonesSeleccionadas, MovimientosCancelados, ExamenTotales, User, Role, Token
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
            return getExam(data)
        elif data["what"] == "loginUser":
            return loginUser(data)
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

def getExam(data):
    logging.debug("getExam called")
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
            raise NameError("Usuario invalido")   
    except Exception as e:
        session.rollback()
        raise JsonError(description="Exception:" + str(e))            
    finally:
        session.close()
