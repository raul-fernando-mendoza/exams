import unittest
import json
import logging

import main


log = logging.getLogger("cheneque")
log.setLevel(logging.DEBUG)

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        main.deleteCertificateMaterialEnrollment('11435bb4-514f-4e7b-907c-bdfc712f4739')


if __name__ == '__main__':
    unittest.main()

