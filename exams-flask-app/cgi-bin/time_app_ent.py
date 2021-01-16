#!/usr/bin/python
from wsgiref.handlers import CGIHandler
from time_app import app

CGIHandler().run(app)
