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

class TestObservacion(unittest.TestCase):
    
    def testObservaciones(self):

            observaciones = exam_app_dao.getObservacion(1)
            logging.debug("result:" + json.dumps(observaciones,  indent=4, sort_keys=True));
    
if __name__ == '__main__':
    unittest.main()