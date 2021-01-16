#!/usr/bin/env python
# -*- coding: UTF-8 -*-

print("Content-Type: text/html\n")
import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="eApp",
  password="odroid",
  database="entities"
)

print(mydb)
mycursor = mydb.cursor()

mycursor.execute("SHOW TABLES")

for x in mycursor:
  print(x)


