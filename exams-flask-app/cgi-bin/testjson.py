#!/usr/bin/env python
# -*- coding: UTF-8 -*-
print("Content-Type: text/html\n")
import json
from mod_python import apache 

def index(req):
    data = json.loads(req.form['data'])
    x = data[-1]['foo']
    req.write("value: " + x)
