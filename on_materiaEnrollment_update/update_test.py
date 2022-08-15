import unittest
import json
import logging

import firebase_admin
firebase_admin.initialize_app( )

from firebase_admin import firestore

from main import onMateriaEnrollmentUpdate 

log = logging.getLogger("cheneque")

class TestExamenObservations(unittest.TestCase):

    def testDeleteObject(self):
        db = firestore.client()
        onMateriaEnrollmentUpdate( db, '80020722-e0bf-4210-a55d-5f602633121e')



if __name__ == '__main__':
    unittest.main()