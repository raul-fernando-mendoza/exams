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
        main.createCertificateExamGrade(db, 'dfba3e9b-670e-4f6a-bab5-e756c78a2878')


if __name__ == '__main__':
    unittest.main()

