#!/usr/bin/env python
# -*- coding: UTF-8 -*-

print("Content-Type: text/html\n")
import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="eApp",
  password="odroid"
)

print(mydb)
