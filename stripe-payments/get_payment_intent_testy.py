import unittest
import json
import logging
from main import getPaymentIntent


log = logging.getLogger("cheneque")

class TestFireStore(unittest.TestCase):

    def test01_getPaymentIntent(self):
        result = getPaymentIntent("pi_3LemnmFedVXPScZd1PBAUMVp")
        print("result:" + json.dumps(result))



if __name__ == '__main__':
    unittest.main()