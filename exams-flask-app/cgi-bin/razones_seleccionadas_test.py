import unittest
import exam_app_dao
import logging


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started')    

class TestRazonesSeleccionadas(unittest.TestCase):
    
    def test_insert(self):
        n = exam_app_dao.razones_seleccionadas_insert(examen_id=1,
            exercise_id="exe1",
            row_id="seq2",
            col_id="col3",
            reason_id="razon_id")
        self.assertEqual(n.exercise_id, "exe1")
    
    def test_clean(self):
        n = exam_app_dao.razones_seleccionadas_remove(examen_id=1)
        self.assertTrue(n, True)

if __name__ == '__main__':
    unittest.main()