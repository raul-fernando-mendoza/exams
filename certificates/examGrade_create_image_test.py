import unittest
import json
import logging

import firebase_admin
from firebase_admin import credentials
import environments
firebase_admin.initialize_app(environments.config["cred"] )

from google.cloud import storage
import certificates

log = logging.getLogger("cheneque")

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
            storage_client = storage.Client()
            
            #logging.debug( json.dumps(obj,  indent=4, sort_keys=True) )
            certificates.createStorageCertificate( storage_client, "claudia_certificate.jpg" , 'Raul Mendoza',
        title = "Coordinación y Resistencia"
        #title = "Coordinación"
        #title="Técnica 2 «Ejercicio de competencia T2»"
        )

            #self.assertTrue(obj["id"] == "test1")           



if __name__ == '__main__':
    unittest.main()