import unittest
from datetime import date
import json
import logging
from json import JSONEncoder

import db
from models import Producto, TipoExamen, Maestro, Estudiante, Examen, ExamenObservaciones, RazonesSeleccionadas, OtrasRazonesSeleccionadas
import json
import exam_app_dao

logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started') 

class MyEncoder(JSONEncoder):
        def default(self, o):
            return o.__dict__ 

class TestExamenObservations(unittest.TestCase):
    """
    def testCreate(self):
        estudiante = Estudiante(
                nombre = "raul",
                apellidoPaterno = "Mendoza",
                apellidoMaterno = "Huerta"
            
        )
        examen = Examen(
            id = None,
            exam_type_id = 1,
            estudiante_id = 1,
            maestro_id = 1,
            grado = 1,
            fechaApplicacion = date.today(),
            completado = False
        )

        observacion = ExamenObservaciones( 
            exercise_id="exe2",
            row_id="seq2",
            col_id="head2",
            is_selected=True
        )
        examen.observaciones.append(observacion)

        db.session.add(examen)
        db.session.commit()
        logging.debug(examen)
        self.assertTrue(examen.id, 1)
    

    def testAppend(self):

        examen = db.session.query(Examen).filter_by(id=15).first()
        

        observacion = ExamenObservaciones( 
            exercise_id="exe6",
            row_id="seq6",
            col_id="head67",
            is_selected=True
        )
        examen.observaciones.append(observacion)

        db.session.commit()
        logging.debug(examen.observaciones)
        self.assertTrue(examen.id, 1)
    """
    """
    def testUpdate(self):
        estudiante = Estudiante(
                nombre = "raul",
                apellidoPaterno = "Mendoza",
                apellidoMaterno = "Huerta"
            
        )
        examen = db.session.query(Examen).filter_by(id=15).first()
        examen.observaciones.clear()

        observacion = ExamenObservaciones( 
            exercise_id="exe6",
            row_id="seq6",
            col_id="head6",
            is_selected=True
        )
        examen.observaciones.append(observacion)

        db.session.commit()
        logging.debug(examen.observaciones)
        self.assertTrue(examen.id, 1)
    """
    """
    def testAppend(self):

        examen = db.session.query(Examen).filter_by(id=15).first()
        if not examen:
            logging.debug("no existe")
        else:
            db.session.delete(examen)
            db.session.commit()   
        self.assertTrue(True, 1)
    """
    """
    def testSaveExam(self):
        exam = {
            "entities":{
                'id':15,
                'examen_observaciones':[
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1',
                    'col_id':"c1",
                    'is_selected':True
                    },
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1',
                    'col_id':"c2",
                    'is_selected':True
                    }
                ],
                'razones_seleccionadas':[
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1',
                    'col_id':"c1",
                    'reason_id':1
                    },
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1',
                    'col_id':"c2",
                    'reason_id':1
                    }
                ],
                "otras_razones_seleccionadas":[
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1',
                    'col_id':"c1", 
                    "otra_razon":"primera razon" 
                    },
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1',
                    'col_id':"c2", 
                    "otra_razon":"segunda razon" 
                    }                  
                ],
                "movimientos_cancelados":[
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1'
                    },
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r2'
                    }
                ],
                "examen_totales":[
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r1',
                    'row_total':10.2                        
                    },
                    {
                    'examen_id':15,
                    'exercise_id':1,
                    'row_id':'r2',
                    'row_total':11.2                        
                    }                    
                ]
            }
        }
        exam_app_dao.SaveExamen(exam)
        """
    
    def testGetExam(self):
            data = {
                "entities":{
                    "id":17
                }
            }
            exam = exam_app_dao.getExamen(data)
            logging.debug( json.dumps(exam,  indent=4, sort_keys=True) )
            #data["entities"] = exam
            #result = exam_app_dao.SaveExamen(data)
            #logging.debug(result)
    
if __name__ == '__main__':
    unittest.main()