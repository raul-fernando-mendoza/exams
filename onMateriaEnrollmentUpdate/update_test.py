import unittest
import json
import logging

import firebase_admin
firebase_admin.initialize_app( )

from firebase_admin import firestore

from main import materiaEnrollmentUpdate 

log = logging.getLogger("cheneque")

class TestExamenObservations(unittest.TestCase):

    def testDeleteObject(self):
        db = firestore.client()
        materiaEnrollmentUpdate( db, '2bf3a406-b649-4eac-9ecb-4621f67ef51a')

if __name__ == '__main__':
    unittest.main()