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
        main.createCertificateExamGrade(db, '0b211373-75e7-425d-8544-27ea4c627a8a')


if __name__ == '__main__':
    unittest.main()

