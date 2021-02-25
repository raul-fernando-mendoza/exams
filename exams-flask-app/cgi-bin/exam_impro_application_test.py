import unittest
import json
import logging
import exam_app_dao
import datetime


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started') 

class TestExam(unittest.TestCase):
    """
    def testGetExamApplication(self):
            data = {
                    "what":"getExamImproApplication",
                    "id":1
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) )
    
    def testaddExamApplication(self):
            data = {
                    "what":"addExamImproApplication",
                    "exam_impr_type_id": 1, 
                    "estudiante_id": 1, 
                    "fechaApplicacion": datetime.date(2021,3,28) 
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) )
    
    def testupdateExamImproApplicationParameter(self):
            data = {
                    "what":"updateExamImproApplicationParameter",
                    "exam_impro_application_id": 4,
                    "exam_impro_parameter_id":1,
                    "maestro_id": 2,
                    "completado":False
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) ) 
    
    def testaddExamImproApplicationRemovedQuestion(self):
            data = {
                    "what":"addExamImproApplicationRemovedQuestion",
                    "exam_impro_application_parameter_id": 11,
                    "exam_impro_question_id":12
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) ) 
    
    def testdeleteExamImproApplicationRemovedQuestion(self):
            data = {
                    "what":"deleteExamImproApplicationRemovedQuestion",
                    "exam_impro_application_parameter_id": 11,
                    "exam_impro_question_id":12
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) )           
                
    def testUpdateExamImproApplicationGradedQuestion(self):
            data = {
                    "what":"updateExamImproApplicationGradedQuestion",
                    "exam_impro_application_parameter_id": 11,
                    "exam_impro_question_id":12,
                    "grade":85
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) ) 
    
    def testGetExamImproApplicationParameter(self):
            data = {
                    "what":"getExamImproApplicationParameter",
                    "maestro_id": 2,
                    "completado":False
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) ) 
    """
    #curl -X POST --data '{"what":"searchExamImproApplication","estudiante_id": "","maestro_id": "","completado": "","parameter_completado":""}' http://localhost:80/api/exam_app_ent.py/requestapi
    def testGetExamImproApplicationParameter(self):
            data = {
                    "what":"searchExamImproApplication",
                    "estudiante_id": "",
                    "maestro_id": "",
                    "completado": "",
                    "parameter_completado":""
            }
            result = exam_app_dao.apiProcess(data)
            logging.debug( json.dumps(result,  indent=4, sort_keys=False) ) 

if __name__ == '__main__':
    unittest.main()