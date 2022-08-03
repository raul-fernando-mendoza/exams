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
        main.generateCertificate(db, 'bb7a1515-7a0e-4b38-886d-c94f4012c832')


if __name__ == '__main__':
    unittest.main()

