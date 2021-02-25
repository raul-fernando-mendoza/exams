import sys
import json
import logging
import services_main 


#curl -X POST --data '{"what": "getObservacion", "tipo_examen_id":"1"}' http://laquintacumbres.com/python/process_post_json.py



#logging.basicConfig(filename='/home/www/laquintacumbres.com/python/services_api.log',  level=logging.DEBUG)
logging.debug('process_post_json called')
try:
    POST={}
    import os
    logging.debug("REQUEST_METHOD:" + str(os.environ['REQUEST_METHOD']) )
    args=sys.stdin.read()
    logging.debug("args:" + str(args))
    if "OPTIONS" ==  os.environ['REQUEST_METHOD']:
        logging.debug("responding to options")
        print("Access-Control-Allow-Origin:*", end="\r\n")
        print("Access-Control-Request-Method: GET, POST, OPTIONS, PUT, DELETE", end="\r\n")
        print("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method", end="\r\n")
        print("Allow: *", end="\r\n\r\n", flush=True)
        print("200 OK")
    else:
        print("Access-Control-Allow-Origin: *", end="\r\n")
        print("Access-Control-Allow-Methods: GET, POST, OPTIONS", end="\r\n")
        print("Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range",end="\r\n")
        print("Access-Control-Expose-Headers: Content-Length,Content-Range", end="\r\n")    
        print("Content-type: application/json", end="\r\n\r\n", flush=True)
        obj= json.loads(args)
        logging.debug( json.dumps(obj,  indent=4, sort_keys=True) )
        result = services_main.request_process( obj )
        print(json.dumps(result ,  indent=4, sort_keys=True))        	

except Exception as e:
    logging.error("error:" + str(e) )
logging.debug("end.")