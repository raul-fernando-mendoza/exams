import unittest
import json
import logging

import firebase_admin

from google.cloud import firestore
firebase_admin.initialize_app()

from google.cloud import storage
import main

log = logging.getLogger("cheneque")

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        db = firestore.Client()
            
        main.generateCertificate(db, '435ac518-901e-4927-89c2-446eed042a74')          

if __name__ == '__main__':
    unittest.main()