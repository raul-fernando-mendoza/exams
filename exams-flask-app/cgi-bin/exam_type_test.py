import unittest
from datetime import date
import json
import logging
from json import JSONEncoder

import db
from models import Producto, TipoExamen, Maestro, Estudiante, Examen, ExamenObservaciones, RazonesSeleccionadas, OtrasRazonesSeleccionadas
import json
import exam_app_dao
from exam_models import *

from db import Session

logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started') 

class MyEncoder(JSONEncoder):
        def default(self, o):
            return o.__dict__ 

class TestExamenObservations(unittest.TestCase):

    """
    def testGetExamType(self):
        session = Session()
        examen = session.query(ExamType).filter_by(type_id=1).first()
        print( json.dumps(examen.toJSON(),  indent=4, sort_keys=True))
        session.close()
    """
    
    def testGetExamType(self):
            data = {
                    "what":"getExamType",
                    "type_id":1
            }
            exam_type = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(exam_type,  indent=4, sort_keys=True) )
    
if __name__ == '__main__':
    unittest.main()