import json
import logging
import firebase_admin

import datetime
from json import JSONEncoder
import backup

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.DEBUG)

log = logging.getLogger("exams")
log.setLevel(logging.DEBUG)
            
def backupfull(request):
    log.debug("**** backupfull receive:" + str(request))
    log.debug("**** backupfull type:" + str(type(request)))
    log.debug("**** backupfull method:" + str(request.method))
    log.debug("**** backupfull content-type:" + str(request.content_type))
    log.debug("**** backupfull mimetype:" + str(request.mimetype))    
    log.debug("**** backupfull is_json:" + str(request.is_json))      
    log.debug("**** backupfull get content_encoding:" + str(request.content_encoding))    
    log.debug("**** backupfull get data:" + str(type(request.get_data())))
    log.debug("**** backupfull decode:" + str(request.get_data().decode()))

    # For more information about CORS and CORS preflight requests, see:
    # https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    obj = {"code":"success"}
    try:
        log.debug("main backupfull has been called")
        #req = request.get_json(force=True)
        #log.debug("data:" + str(req))

        backup.backupAll()
    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 404, headers)
    return ({"result":obj}, 200, headers)
