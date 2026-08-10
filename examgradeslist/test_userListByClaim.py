import json
import unittest

from examgradelist import userListByClaim


class TestGetGradesList(unittest.TestCase):
    def test_get_grades_list_returns_expected_json(self):
        result = userListByClaim("role-evaluador-raxacademy")

        print(result)


if __name__ == "__main__":
    unittest.main()
