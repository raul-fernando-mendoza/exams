import unittest
import json
import logging

import main

log = logging.getLogger("cheneque")
log.setLevel(logging.DEBUG)

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        main.createCertificateMateriaEnrollment('a3878dd8-2e01-4f6c-af67-5734e32e72e0')


if __name__ == '__main__':
    unittest.main()

