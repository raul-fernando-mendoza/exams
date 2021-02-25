import sys
import logging

def request_process(request):
    obj = None
    try:
        logging.debug("processing request:" + str(request) )
        obj = {
            "test":"hello world"
        }
    except Exception as e:
        logging.error("error:" + str(e) )
    finally:
        logging.debug("finally")
    return obj