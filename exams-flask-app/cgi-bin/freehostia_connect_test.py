import sys

print("Content-type: text/html", end="\r\n\r\n", flush=True)

try:
    import mysql.connector

    mydb = mysql.connector.connect(
    user="raumen41_wordpress",
    password="Honda2033",     
    host="mysql.freehostia.com",
    #host="localhost",
    
    database="raumen41_wordpress"
    )

    print(mydb) 
    print("end...")
except Exception as e:
    print("error:" + str(e) );