import unittest
import json
import logging
from main import getProductDefaultPrice


log = logging.getLogger("cheneque")

class TestFireStore(unittest.TestCase):

    def test01_listProducts(self):
        result = getProductDefaultPrice("prod_MNGiZUsnJ1PA2t")
        print("result:" + str(result))



if __name__ == '__main__':
    unittest.main()