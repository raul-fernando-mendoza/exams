import sys
import datetime
import json
import logging

import db
from models import Producto, TipoExamen, Maestro, Estudiante, Examen, ExamenObservaciones, RazonesSeleccionadas, OtrasRazonesSeleccionadas
import json

def apiProcess(data):

        logging.debug( "apiProcess:" + str(data)  )
        if data['what'] == 'getExamenesPendientes':
            user_id = data['user_id']
            return getExamenesPendientes(user_id)
        elif data['what'] == 'SaveExamen':
            entities = data['entities']
            logging.debug("entities:" + str(entities))
            observaciones = entities['valores_seleccionados']
            logging.debug("valores_seleccionados:" + str(observaciones))
            for o in observaciones:
                logging.debug("o:" + str(o))
                examenObservaciones_uei(examen_id=o['examen_id'],
                    exercise_id=o['exercise_id'],
                    row_id=o['row_id'],
                    col_id=o['col_id'],
                    is_selected=o['is_selected'])
            
            razones_seleccionadas = entities['razones_seleccionadas']
            logging.debug("razones_seleccionadas:" + str(razones_seleccionadas))
            n = razones_seleccionadas_remove(entities['examen_id'])
            for o in razones_seleccionadas:
                n = razones_seleccionadas_insert(examen_id=o['examen_id'],
                    exercise_id=o['exercise_id'],
                    row_id=o['row_id'],
                    col_id=o['col_id'],
                    reason_id=o["reason_id"])

            otras_razones_seleccionadas = entities['otras_razones_seleccionadas']
            logging.debug("otras_razones_seleccionadas:" + str(otras_razones_seleccionadas))
            n = otras_razones_seleccionadas_remove(entities['examen_id'])
            for o in otras_razones_seleccionadas:
                n = otras_razones_seleccionadas_insert(examen_id=o['examen_id'],
                    exercise_id=o['exercise_id'],
                    row_id=o['row_id'],
                    col_id=o['col_id'],
                    otra_razon=o["otra_razon"])                    
            return entities
        else:
            return json_response(error="action not found")

#curl -X POST --data '{"what": "getExamenesPendientes", "user_id":"raul"}' http://localhost:80/api/exam_app_ent.py/requestapi
#curl -X POST -H "Content-Type: application/json" -d @/var/www/cgi-bin/examen_observaciones.json http://127.0.0.1:5000/requestapi
def getExamenesPendientes(userid):
    logging.debug( "getExamenesPendientes:" + str(userid)  )

    examenes = db.session.query(Examen).filter_by(estudiante_id=1).all()
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
            "applicationDate": exam.fechaApplicacion
            }
       result.append(o)
    logging.debug( result );
    return result
#update else insert ExamenObservaciones
def examenObservaciones_uei(examen_id, exercise_id, row_id, col_id, is_selected):
    logging.debug( "uli_examenObservaciones:" + str(examen_id) + " " + str(exercise_id) + " " + str(row_id) + " " + str(col_id) + " " + str(is_selected) )

    examen_observaciones = db.session.query(ExamenObservaciones).filter_by(examen_id=examen_id,exercise_id=exercise_id, row_id=row_id, col_id=col_id ).first()
    print("results:" + str(examen_observaciones) )
    if examen_observaciones:
        examen_observaciones.is_selected=is_selected
        db.session.commit()
        return examen_observaciones
    else:
        n = ExamenObservaciones( 
            examen_id=examen_id,
            exercise_id=exercise_id,
            row_id=row_id,
            col_id=col_id,
            is_selected=is_selected
		)
        db.session.add(n)
        db.session.commit()
        return n

def razones_seleccionadas_remove(examen_id):
    logging.debug( "razones_seleccionadas_remove:" + str(examen_id)  )

    result = db.session.query(RazonesSeleccionadas).filter_by(examen_id=examen_id ).all()
    for r in result:
        print( "r:" + str(r))
        db.session.delete(r)
    db.session.commit()
    print("results:" + str(result) )
    return True

def razones_seleccionadas_insert(examen_id, exercise_id, row_id, col_id, reason_id):
    logging.debug( "razones_seleccionadas_insert:" + str(examen_id) + " " + str(exercise_id) + " " + str(row_id) + " " + str(col_id) + " " + str(reason_id) )

    n = RazonesSeleccionadas( 
        examen_id=examen_id,
        exercise_id=exercise_id,
        row_id=row_id,
        col_id=col_id,
        reason_id=reason_id
    )
    db.session.add(n)
    db.session.commit()
    return n    

def otras_razones_seleccionadas_remove(examen_id):
    logging.debug( "otras_razones_seleccionadas_remove:" + str(examen_id)  )

    result = db.session.query(OtrasRazonesSeleccionadas).filter_by(examen_id=examen_id ).all()
    for r in result:
        print( "r:" + str(r))
        db.session.delete(r)
    db.session.commit()
    print("results:" + str(result) )
    return True

def otras_razones_seleccionadas_insert(examen_id, exercise_id, row_id, col_id, otra_razon):
    logging.debug( "otras_razones_seleccionadas_insert:" + str(examen_id) + " " + str(exercise_id) + " " + str(row_id) + " " + str(col_id) + " " + str(otra_razon) )

    n = OtrasRazonesSeleccionadas( 
        examen_id=examen_id,
        exercise_id=exercise_id,
        row_id=row_id,
        col_id=col_id,
        otra_razon=otra_razon
    )
    db.session.add(n)
    db.session.commit()
    return n

if __name__ == '__main__':
    # Map command line arguments to function arguments.
    print( sys.argv[1] );
    myjson = json.loads(sys.argv[1])
    print( myjson );
    res = apiProcess(myjson)
    print(res);