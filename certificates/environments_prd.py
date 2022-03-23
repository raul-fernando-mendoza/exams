import logging
from logging import handlers
import sys

from firebase_admin import credentials


logger = logging.getLogger("cheneque")
logger.setLevel(logging.ERROR)

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)

log = logging.getLogger("cheneque")

config = {
    "user":"eApp",
    #"database_host":"10.128.0.12",
    #"database_password":"Argos4905!",
    "database_host":"35.209.18.214",
    "database_password":"Argos4905",    
    "database":"entities",
#    "cred":credentials.Certificate('celtic-bivouac-307316-firebase-adminsdk-pbsww-2ccfde6abd.json')    
}