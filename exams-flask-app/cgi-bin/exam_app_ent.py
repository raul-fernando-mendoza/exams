#!/usr/bin/python
from wsgiref.handlers import CGIHandler
from exam_app import app

CGIHandler().run(app)
