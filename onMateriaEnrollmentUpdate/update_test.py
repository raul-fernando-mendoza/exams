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
        materiaEnrollmentUpdate( db, '05fef2dc-0cd3-4b4a-ac0c-a35d88c50a85')

if __name__ == '__main__':
    unittest.main()