#!/usr/bin/env python
# -*- coding: UTF-8 -*-

print("Content-Type: text/html\n")
import json
data = {
    "president": {
        "name": "Zaphod Beeblebrox",
        "species": "Betelgeusian"
    }
}
print(json.dumps(data,indent=4, sort_keys=True))
