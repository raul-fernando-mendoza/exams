import json
import unittest

from examgradelist import gradesListByEvaluatorId


class TestGetGradesList(unittest.TestCase):
    def test_get_grades_list_returns_expected_json(self):
        result = gradesListByEvaluatorId("62RRzTpiAZUycRzlUXfj5ICmU9o2")

        print(result)


if __name__ == "__main__":
    unittest.main()
