import unittest
import json
import logging

import main


log = logging.getLogger("cheneque")
log.setLevel(logging.DEBUG)

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        main.deleteCertificateMaterialEnrollment('2678376f-61f6-4f95-93af-d18eaeaec47f')


if __name__ == '__main__':
    unittest.main()

