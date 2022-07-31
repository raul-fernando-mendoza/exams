import unittest
import json
import logging

import firebase_admin
import main


log = logging.getLogger("cheneque")

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        db = firestore.client()
        main.generateCertificate(db, '9387000f-213a-4743-bc67-e53a3d2d22b7')


if __name__ == '__main__':
    unittest.main()

