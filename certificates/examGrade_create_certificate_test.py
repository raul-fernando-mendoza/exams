import unittest
import json
import logging

import firebase_admin
from firebase_admin import credentials
firebase_admin.initialize_app()

from google.cloud import storage
import certificates
import uuid

log = logging.getLogger("cheneque")
"""
{
    "certificateId":"raul_test" ,
    "studentName":"Claudia Gamboa",
    "materiaName":"Salsa",
    "label1":"Salsa",
    "label2":"X",
    "label3":"Otros",
    "label4":"www.rax.com",
    "color1":"blue",
    "color2":"red"
}
"""
class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        storage_client = storage.Client()
            
        #logging.debug( json.dumps(obj,  indent=4, sort_keys=True) )
        data = certificates.createStorageCertificate( storage_client, 
        "certificates_master/habilidades_certificate.jpeg",
        "certificates_logos/abanico_icon.jpg",
        "certificates/" + str(uuid.uuid4()) , 
        'CLAUDIA GAMBOA VILLA',
        #title = "Coco * con MUCHOS - y RaRos"
        #title = "Coordinación"
        "Candelabro contemporaneo",
        "www.raxacademy.com",
        "",
        "doble espada",
        "Maria Velasco",
        "blue",
        "yellow"
        )
        print(json.dumps(data))

        #self.assertTrue(obj["id"] == "test1")           



if __name__ == '__main__':
    unittest.main()