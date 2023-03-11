
from firebase_admin import firestore
import json
import logging
import firebase_admin

firebase_admin.initialize_app()
db = firestore.client()

from careerAdvance import careerAdvanceUpdate,careerAdvanceStudentUpdate 


logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)

log = logging.getLogger("examServices")
log.setLevel(logging.ERROR)

#this function will be called manually
#will update the advance in that carrer for students
def examservices(request):
    log.debug("**** create examServices receive:" + str(request))
    log.debug("**** create examServices type:" + str(type(request)))
    log.debug("**** create examServices method:" + str(request.method))
    log.debug("**** create examServices content-type:" + str(request.content_type))
    log.debug("**** create examServices mimetype:" + str(request.mimetype))    
    log.debug("**** create examServices is_json:" + str(request.is_json))      
    log.debug("**** create examServices get content_encoding:" + str(request.content_encoding))    
    log.debug("**** create examServices get data:" + str(type(request.get_data())))
    log.debug("**** create examServices decode:" + str(request.get_data().decode()))

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

    obj = None
    try:
        log.debug("main careerAdvanceUpdate has been called")
        req = request.get_json(force=True)
        log.debug("data:" + str(req))


        if "careerAdvanceUpdate" == req["action"]:
            data = req["data"]
            organizationId = data["organizationId"]
            careerId = data["careerId"]
            obj = careerAdvanceUpdate( db, organizationId, careerId)
        elif "careerAdvanceStudentUpdate" == req["action"]:
            data = req["data"]
            organizationId = data["organizationId"]
            careerId = data["careerId"]
            uid = data["uid"]
            obj = careerAdvanceStudentUpdate( db, organizationId, careerId, uid)            
        else:
            raise Exception("action not found" + str(req["action"]))
        log.debug( json.dumps(obj,  indent=4, sort_keys=True) )
    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 404, headers)
    return ({"result":obj}, 200, headers)
