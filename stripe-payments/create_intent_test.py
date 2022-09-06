import unittest
import json
import logging
from main import create_payment


log = logging.getLogger("cheneque")

class TestFireStore(unittest.TestCase):

    def test01_createPaymentIntent(self):
        result = create_payment("prod_MNGiZUsnJ1PA2t",{"user_uid":101,"materia_id":"abc"})
        print("result:" + json.dumps(result))



if __name__ == '__main__':
    unittest.main()