#!/usr/bin/python
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

Base = automap_base()

# engine, suppose it has two tables 'user' and 'address' set up
engine = create_engine("mysql://eApp:odroid@localhost/entities?charset=utf8")

# reflect the tables
Base.prepare(engine, reflect=True)

# mapped classes are now created with names by default
# matching that of the table name.
Examen = Base.classes.examen
Estudiante = Base.classes.estudiante

session = Session(engine)

# rudimentary relationships are produced
obj = {"nombre":"raul", "apellidoPaterno":"mendoza", "apellidoMaterno":"Huerta"}
estudiante = Base.classes.estudiante( obj )
result = session.add(estudiante)
session.commit()

# collection-based relationships are by default named
# "<classname>_collection"
print (result)