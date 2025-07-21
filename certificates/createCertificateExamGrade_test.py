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
        main.createCertificateExamGrade(db, '839746ec-21ec-419c-8d25-df1503cac3f7')


if __name__ == '__main__':
    unittest.main()

