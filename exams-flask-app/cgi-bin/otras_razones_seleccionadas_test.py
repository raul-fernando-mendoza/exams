import unittest
import exam_app_dao
import logging


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started')    

class TestOtrasRazonesSeleccionadas(unittest.TestCase):
    
    def test_insert(self):
        logging.debug('insert started')   
        n = exam_app_dao.otras_razones_seleccionadas_insert(examen_id=1,
            exercise_id="exe1",
            row_id="seq4",
            col_id="col3",
            otra_razon="esta es otra razon test")
        self.assertEqual(n.exercise_id, "exe1")
    
    def test_clean(self):
        logging.debug('clean started')   
        n = exam_app_dao.otras_razones_seleccionadas_remove(examen_id=1)
        self.assertTrue(n, True)
    
if __name__ == '__main__':
    unittest.main()