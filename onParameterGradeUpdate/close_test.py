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
        closeExamGrade( db, documentId="839746ec-21ec-419c-8d25-df1503cac3f7")

if __name__ == '__main__':
    unittest.main()