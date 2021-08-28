import logging
from logging import handlers
import sys
from firebase_admin import credentials

logger = logging.getLogger("cheneque")
logger.setLevel(logging.DEBUG)

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)

log = logging.getLogger("cheneque")

config = {
    "user":"eApp",
    "database_host":"192.168.15.12",
    "database_password":"odroid",
    "database":"entities",
    "cred":credentials.Certificate('credentials.json')    
}