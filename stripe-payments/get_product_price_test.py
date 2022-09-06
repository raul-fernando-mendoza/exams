import unittest
import json
import logging
from main import list_products


log = logging.getLogger("cheneque")

class TestFireStore(unittest.TestCase):

    def test01_listProducts(self):
        result = list_products()
        print("result:" + json.dumps(result))



if __name__ == '__main__':
    unittest.main()