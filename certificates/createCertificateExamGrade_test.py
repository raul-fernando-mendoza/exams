import unittest
import json
import logging

import firebase_admin
import main


log = logging.getLogger("cheneque")
log.setLevel(logging.DEBUG)

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        db = firestore.client()
        main.createCertificateExamGrade(db, 'c219a2db-9e9f-4d8e-96b6-bffd9e69e7f8')


if __name__ == '__main__':
    unittest.main()

