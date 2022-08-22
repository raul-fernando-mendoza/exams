import unittest
import json
import logging

import main


log = logging.getLogger("cheneque")
log.setLevel(logging.DEBUG)

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        main.deleteCertificateMaterialEnrollment('2bf3a406-b649-4eac-9ecb-4621f67ef51a')


if __name__ == '__main__':
    unittest.main()

