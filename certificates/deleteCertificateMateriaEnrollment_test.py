import unittest
import json
import logging

import main


log = logging.getLogger("cheneque")
log.setLevel(logging.DEBUG)

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        main.deleteCertificateMaterialEnrollment('c00cc988-441c-4ee0-96e0-f87b124aa63b')


if __name__ == '__main__':
    unittest.main()

