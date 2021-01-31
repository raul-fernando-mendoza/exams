import unittest
import models

class TestExamenObservations(unittest.TestCase):
    """
    def testUpdateInsert(self):
        u = exam_app_dao.examenObservaciones_uei(examen_id=1,
            exercise_id=1,
            row_id=1,
            col_id=1,
            is_selected=True)
        self.assertEqual(u.exercise_id, 1)
    """
    def test_isupper(self):
        u = exam_app_dao.examenObservaciones_uei(examen_id=1,
            exercise_id="exe1",
            row_id="seq1",
            col_id="head",
            is_selected=False)
        self.assertFalse(u.is_selected)

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main()