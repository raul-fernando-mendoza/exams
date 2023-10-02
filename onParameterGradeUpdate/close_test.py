import unittest
import json
import logging

import firebase_admin
firebase_admin.initialize_app( )

from firebase_admin import firestore

from main import closeExamGrade 

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)
log = logging.getLogger("careerAdvance")
log.setLevel(logging.DEBUG)

class TestExamenObservations(unittest.TestCase):

    def testDeleteObject(self):

        db = firestore.client()
        closeExamGrade( db, documentId="3e251884-07ab-4576-ac39-7f8bf7a215e2")

if __name__ == '__main__':
    unittest.main()