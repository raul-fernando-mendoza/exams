import unittest
import json
import logging
from google.cloud import firestore
from google.cloud import storage
import main


log = logging.getLogger("cheneque")
log.setLevel(logging.DEBUG)

from firebase_admin import firestore

class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
        """
        storage_client = storage.Client()

        bucket_name = storage_client.project + ".appspot.com"
        
        bucket = storage_client.get_bucket(bucket_name)

        log.debug("exist:" + str(bucket.exists()))
        blobs = bucket.list_blobs(prefix="organizations")

        for blob in blobs:
            log.debug(blob.name)
 
        """
        data = main.createCertificateMateriaEnrollment('77137997-b443-402b-8de8-51cb9795468c')
        print(json.dumps(data))

    def _test02_addDocument(self):
        data = main.createCertificateMateriaEnrollment('e64a84f4-d125-4008-ad3f-0370a5ba1757')
        print(json.dumps(data))


if __name__ == '__main__':
    unittest.main()

