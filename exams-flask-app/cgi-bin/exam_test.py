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

class TestExam(unittest.TestCase):

    """
    def testGetExamType(self):
        session = Session()
        examen = session.query(ExamType).filter_by(type_id=1).first()
        print( json.dumps(examen.toJSON(),  indent=4, sort_keys=True))
        session.close()
    """
    
    def testGetExamType(self):
            data = {
                    "what":"getExamApplication",
                    "application_id":1
            }
            exam_application = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(exam_application,  indent=4, sort_keys=True) )
    
if __name__ == '__main__':
    unittest.main()