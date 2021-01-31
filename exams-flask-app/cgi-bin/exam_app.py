from datetime import datetime
from flask import Flask, request, abort
from flask_json import FlaskJSON, JsonError, json_response, as_json
from flask_cors import CORS, cross_origin

from exam_app_dao import apiProcess
import logging
import json



app = Flask(__name__)
CORS(app, support_credentials=True)
#cors = CORS(app, resources={r"/exam-app/*": {"origins": "*"}})
FlaskJSON(app)

@app.route('/')
def hello():
    logging.debug( "REQUEST HELLO EXAM-APP"  )
    return "HELLO from exam-app"



@app.route('/get_time')
def get_time():
    now = datetime.utcnow()
    return json_response(time=now)


@app.route('/increment_value', methods=['POST'])
def increment_value():
    # We use 'force' to skip mimetype checking to have shorter curl command.
    data = request.get_json(force=True)
    try:
        logging.debug( "REQUEST JSON_5:" + str(data)  )
        value = int(data['value'])
    except (KeyError, TypeError, ValueError):
        raise JsonError(description='Invalid value.')
    return json_response(value=value + 1)

#curl -X POST --data '{"what": "list"}' http://localhost:80/api/exam_app_ent.py/requestapi
#from windows
#curl -X POST --data "{\"what\": \"list_curl\"}" http://192.168.15.12:80/api/exam_app_ent.py/requestapi

#curl -X POST -H "Content-Type: application/json" -d @/var/www/cgi-bin/examen_observaciones.json http://127.0.0.1:5000/requestapi
#curl -X POST -H "Content-Type: application/json" -d @/var/www/cgi-bin/examen_observaciones.json http://192.168.15.12/flask/exam_app/requestapi

@app.route('/requestapi', methods=['POST'])
@cross_origin(supports_credentials=True)
def requestapi():
    # We use 'force' to skip mimetype checking to have shorter curl command.
    logging.debug("requestapi has been called")
    data = request.get_json(force=True)
    logging.debug("requestapi:" + str(data))
    try:
        resp = apiProcess(data)
        logging.debug("result:" + json.dumps(resp,  indent=4, sort_keys=True));
        
    except NameError as e:
        logging.error("a named error has occurred:" + str(e))
        abort(404, description=str(e))
    return json_response(result=resp);


@app.route('/get_value')
@as_json
def get_value(user_id):
    return dict(value=12)


if __name__ == '__main__':
    logging.basicConfig(filename='/var/www/cgi-bin/exam_app.log',  level=logging.DEBUG)
    logging.debug('logger has started')    
    app.run()
