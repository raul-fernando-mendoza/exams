#!/usr/bin/env python

import logging
import sys

from logging import handlers

#logging.basicConfig(filename='/var/www/cgi-bin/exam_app.log', format='%(asctime)-15s %(message)s', level=logging.DEBUG)
logger = logging.getLogger("exam_app")
logger.setLevel(logging.DEBUG)

## Here we define our formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

logHandler = handlers.TimedRotatingFileHandler( '/var/www/cgi-bin/log/exam_app.log', when='M', interval=1, backupCount=2)
logHandler.setLevel(logging.DEBUG)
## Here we set our logHandler's formatter
logHandler.setFormatter(formatter)

logger.addHandler(logHandler)
logger.info('logger has started') 

logging.info("from logging")
sys.path.insert(0,'/var/www/cgi-bin')

from exam_app import app as application
application.secret_key = '1234abcd'

if __name__ == '__main__':
    print("hello from exam_app.wsgi")
