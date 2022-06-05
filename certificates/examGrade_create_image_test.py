import unittest
import json
import logging

import firebase_admin
from firebase_admin import credentials
import environments
firebase_admin.initialize_app()

from google.cloud import storage
import certificates

log = logging.getLogger("cheneque")

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
            storage_client = storage.Client()
            
            #logging.debug( json.dumps(obj,  indent=4, sort_keys=True) )
            certificates.createStorageCertificate( storage_client, "raul_certificate.jpg" , 'CLAUDIA GAMBOA VILLA',
        #title = "Coco * con MUCHOS - y RaRos"
        #title = "Coordinación"
        "Candelabro",
        "Habilidad",
        "Candelabro",
        "",
        "WWW.RAXACADEMY.COM",
        "#d9ad43",
        "#D40000"
        )

            #self.assertTrue(obj["id"] == "test1")           



if __name__ == '__main__':
    unittest.main()