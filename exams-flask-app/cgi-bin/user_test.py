import unittest
from datetime import date
import json
import logging
from json import JSONEncoder

import db
from models import Producto, TipoExamen, Maestro, Estudiante, Examen, ExamenObservaciones, RazonesSeleccionadas, OtrasRazonesSeleccionadas
import json
import exam_app_dao
import uuid
from datetime import datetime  
from datetime import timedelta

logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started') 


class TestExamenObservations(unittest.TestCase):
    
    def testGetUser(self):

            data = {
                "entities":{
                    "user_name":"claudia",
                    "password":"Argos4905q"
                }
            }
            try:
                result = exam_app_dao.loginUser(data)
            except NameError as e:
                logging.error( e)            
            logging.debug(json.dumps(result))
    """
    def testExamenesPendientes(self):
        logging.debug(exam_app_dao.getExamenesPendientes(1))
    """       
if __name__ == '__main__':
    unittest.main()