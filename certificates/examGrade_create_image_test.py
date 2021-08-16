import unittest
import json
import logging
from certificates import createStorageCertificate

from google.cloud import storage

logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started') 

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
            storage_client = storage.Client()
            
            #logging.debug( json.dumps(obj,  indent=4, sort_keys=True) )
            createStorageCertificate( storage_client, "claudia_certificate.jpg" , 'Raul Mendoza',
        title = "Prueba 2. «Coordinación y Resistencia»"
        #title = "Coordinación"
        #title="Técnica 2 «Ejercicio de competencia T2»"
        )

            #self.assertTrue(obj["id"] == "test1")           



if __name__ == '__main__':
    unittest.main()