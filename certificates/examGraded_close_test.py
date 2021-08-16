import unittest
import json
import logging


import firebase_admin


from firebase_admin import credentials
cred = credentials.Certificate('C:\projects\exams\credentials\.credentials.json')
firebase_admin.initialize_app(cred)


from firebase_admin import firestore
db = firestore.client()

from main import closeExamGrade





logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started') 


class TestFireStore(unittest.TestCase):

    def test01_addDocument(self):
            
            #logging.debug( json.dumps(obj,  indent=4, sort_keys=True) )
            closeExamGrade( db, "u7zYVCJVzpVNzz3jnzoL")
            #self.assertTrue(obj["id"] == "test1")           



if __name__ == '__main__':
    unittest.main()