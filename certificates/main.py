#gcloud functions deploy examgradesparameterupdate --region=us-central1 --entry-point examgradesparameterupdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/celtic-bivouac-307316/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" 
from google.cloud import firestore
from google.cloud import storage
import json
import logging
import certificates

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)

log = logging.getLogger("exams")
log.setLevel(logging.ERROR)


    

def createCertificate(request):
    log.error("**** create certificates receive:" + str(request))
    log.error("**** create certificates type:" + str(type(request)))
    log.error("**** create certificates method:" + str(request.method))
    log.error("**** create certificates content-type:" + str(request.content_type))
    log.error("**** create certificates mimetype:" + str(request.mimetype))    
    log.error("**** create certificates is_json:" + str(request.is_json))      
    log.error("**** create certificates get content_encoding:" + str(request.content_encoding))    
    log.error("**** create certificates get data:" + str(type(request.get_data())))
    log.error("**** create certificates decode:" + str(request.get_data().decode()))

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
        obj = request.get_json(force=True, silent=False)
        if obj == None:
            log.error("***** request can not be read as json")
            raise Exception("json cannot be read")
        else:
            log.error("***** request was read as json")
        storage_client = storage.Client()

        certificateId = obj["certificateId"]
        studentName = obj["studentName"]
        materiaName = obj["materiaName"]
        label1 = obj["label1"]
        label2 = obj["label2"]
        label3 = obj["label3"]
        label4 = obj["label4"]
        color1 = obj["color1"]
        color2 = obj["color2"]


        data = certificates.createStorageCertificate( storage_client, 
        "certificates/" + certificateId ,
         studentName,
        materiaName,
        label1,
        label2,
        label3,
        label4,
        color1,
        color2
        )        
    
    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 200, headers)
    return ({"result":data}, 200, headers)



