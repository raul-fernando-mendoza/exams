import unittest
import json
import logging

import firebase_admin
firebase_admin.initialize_app( )

from firebase_admin import firestore

from careerAdvance import careerAdvanceStudentUpdate 

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)
log = logging.getLogger("careerAdvance")
log.setLevel(logging.DEBUG)

class TestExamenObservations(unittest.TestCase):

    def testDeleteObject(self):

        db = firestore.client()
        careerAdvanceStudentUpdate( db, organizationId="raxacademy", careerId="31a1f374-8e26-4c12-9b94-233de68e4217",studentUid='5EwPPAIGiNRNOrZxqewAa15pplA2')

if __name__ == '__main__':
    unittest.main()