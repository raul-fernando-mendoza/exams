import unittest
import json
import logging
import exam_app_dao


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started') 

class TestExam(unittest.TestCase):
    """
    def testGetExamType(self):
            data = {
                    "what":"getExamImproType",
                    "id":1
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) )
    """
    def testGetExamType(self):
            data = {
                    "what":"getExamImproType",
                    "id":""
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) )    
if __name__ == '__main__':
    unittest.main()