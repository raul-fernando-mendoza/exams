import unittest
import json
import logging

from google.cloud import firestore
from google.cloud import storage

import main

log = logging.getLogger("cheneque")


class TestExamenObservations(unittest.TestCase):

    def d_testUpdateMetadata(self):

            firebase_client = firestore.Client()
            storage_client = storage.Client()
            bucket_name = 'cheneque-dev-videos'
            blob_name = 'rax-academy/videos/readme.txt'
            obj = main.onMetadataUpdate(firebase_client, storage_client, bucket_name, blob_name ,{})  

            self.assertIsNotNone(obj)
            log.debug( json.dumps(obj,  indent=4, sort_keys=True) )   
    
    def disabled_testUpdateMetadata2(self):

            fc = firestore.Client() 
            list = fc.collection("ObjectMetadataUpdate").where( u"acl" ,  u'array_contains' ,         {
            "entity": "user-rfmh1972@gmail.com",
            "role": "OWNER"
            } ).get()
            if len(list) > 0 :
                log.debug( json.dumps( list[0].to_dict(),  indent=4, sort_keys=True) ) 
            else:
                log.debug( "nothing found" )

    def testUpdateMetadata3(self):

            fc = firestore.Client() 
            list = fc.collection("ObjectMetadataUpdate").where( u"acl" ,  u'array_contains_any' ,
            [
                {
                    "entity":"user",
                    "name": "rfmh1972@gmail.com",
                    "access": "OWNER"
                } ,
                {
                    "entity":"user",
                    "name": "rfmh1972@gmail.com",
                    "access": "READER"
                } 
            ]).get()
            if len(list) > 0 :
                for e in list:
                    log.debug( json.dumps( e.to_dict(),  indent=4, sort_keys=True) ) 
            else:
                log.debug( "nothing found" )

if __name__ == '__main__':
    unittest.main()