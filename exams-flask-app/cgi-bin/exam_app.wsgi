#!/usr/bin/env python

import logging
import sys
logging.basicConfig(filename='/var/www/cgi-bin/exam_app.log', format='%(asctime)-15s %(message)s', level=logging.DEBUG)
logging.debug('logger has started') 
sys.path.insert(0,'/var/www/cgi-bin/')
from exam_app import app as application
application.secret_key = '1234abcd'
