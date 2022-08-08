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
        main.createCertificateExamGrade(db, '4968eaee-be70-4ed9-bc06-a09f5d13d947')


if __name__ == '__main__':
    unittest.main()

