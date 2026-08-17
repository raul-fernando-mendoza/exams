import json
import unittest

from examgradelist import getStudentDisplayName

import firebase_admin
#firebase_admin.initialize_app("/Volumes/Data/projects/firebase_datamesh_credentials.json")

class Test_getStudentDisplayName(unittest.TestCase):
    def test_get_grades_list_returns_expected_json(self):
        
        #result = getStudentDisplayName("oL8yVbC0u9SEDUX71MWc48Yc4Rb2")
        result = getStudentDisplayName("TMGEQbuWLtYGRy9rxomsp3SycOq2")

        print(result)


if __name__ == "__main__":
    unittest.main()