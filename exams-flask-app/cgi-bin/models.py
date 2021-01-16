import db
from sqlalchemy import Table, Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import json

class Producto(db.Base):
    __tablename__ = 'producto'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    precio = Column(Float)
    def __init__(self, nombre, precio):
        self.nombre = nombre
        self.precio = precio
    def __repr__(self):
        return f'Producto({self.nombre}, {self.precio})'
    def __str__(self):
        return self.nombre
        
class Estudiante(db.Base):
    __tablename__ = 'estudiante'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    apellidoPaterno = Column(String(50), nullable=False)
    apellidoMaterno = Column(String(50), nullable=False)
    def __init__(self, nombre, apellidoPaterno, apellidoMaterno):
        self.nombre = nombre
        self.apellidoPaterno = apellidoPaterno
        self.apellidoMaterno = apellidoMaterno
    def __repr__(self):
        return f'Estudiante({self.nombre}, {self.apellidoPaterno}, {self.apellidoMaterno})'
    def __str__(self):
        obj = { "id":self.id,
                "nombre":self.nombre,
				"apellidoPaterno":self.apellidoPaterno,
				"apellidoMaterno":self.apellidoMaterno
			}
        return json.dumps( obj );
        
class Maestro(db.Base):
    __tablename__ = 'maestro'
    id = Column(Integer, primary_key=True)
    nombre = Column(String(50), nullable=False)
    apellidoPaterno = Column(String(50), nullable=False)
    apellidoMaterno = Column(String(50), nullable=False)
    def __init__(self, nombre, apellidoPaterno, apellidoMaterno):
        self.nombre = nombre
        self.apellidoPaterno = apellidoPaterno
        self.apellidoMaterno = apellidoMaterno
    def __repr__(self):
        return f'Maestro({self.nombre}, {self.apellidoPaterno}, {self.apellidoMaterno})'
    def __str__(self):
        obj = { "id":self.id,
                "nombre":self.nombre,
				"apellidoPaterno":self.apellidoPaterno,
				"apellidoMaterno":self.apellidoMaterno
			}
        return json.dumps( obj );
        
class TipoExamen(db.Base):
    __tablename__ = 'tipo_examen'
    id = Column(Integer, primary_key=True)
    label = Column(String(50), nullable=False)
    def __init__(self, label):
        self.label = label
    def __repr__(self):
        return "{" + f'"id":{self.id}, "label":{self.label} ' + "}"
    def __str__(self):
        obj = { "id":self.id, "label":self.label }
        return json.dumps( obj );
        #return f'TipoExamen( {self.label} )'
        
class Examen(db.Base):
    __tablename__ = 'examen'
    id = Column(Integer, primary_key=True)    
    grado = Column(Integer)
    completado = Column(Boolean)
    fechaApplicacion = Column(DateTime)
    exam_type_id = Column(Integer, ForeignKey('tipo_examen.id'))
    tipoExamen = relationship("TipoExamen")
    estudiante_id = Column(Integer, ForeignKey('estudiante.id'))
    estudiante = relationship("Estudiante")
    maestro_id = Column(Integer, ForeignKey('maestro.id'))
    maestro = relationship("Maestro")   
    def __init__(self, exam_type_id, estudiante_id, maestro_id, grado, fechaApplicacion):
        self.exam_type_id = exam_type_id
        self.estudiante_id = estudiante_id
        self.maestro_id = maestro_id
        self.grado = grado
        self.fechaApplicacion = fechaApplicacion
    def __repr__(self):
        return f'Examen({self.id}, {self.tipoExamen}, {self.grado}, {self.estudiante}, {self.maestro}, {self.fechaApplicacion}, {self.completado} )'
    def __str__(self):
        obj = { "id":self.id,
		        "tipoExamen": self.tipoExamen,
				"grado":self.grado,
				"alumno": self.estudiante,
				"maestro":self.maestro,                
				"fechaApplicacion":self.fechaApplicacion,
				"completado":self.completado
			}
        return json.dumps( obj )


class ExamenObservaciones(db.Base):
    __tablename__ = 'examen_observaciones'
    
    examen_id = Column(Integer, ForeignKey('examen.id'), primary_key=True)

    exercise_id = Column( String(50) , primary_key=True ) 
    row_id = Column(String(50) , primary_key=True)    
    col_id = Column(String(50) , primary_key=True)
    is_selected = Column(Boolean, nullable=False)
    
    def __init__(self, examen_id, exercise_id, row_id, col_id, is_selected):
        self.examen_id = examen_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.is_selected = is_selected
    def __repr__(self):
        return f'ExamenObservaciones({self.examen_id}, {self.exercise_id}, {self.row_id}, {self.col_id}, {self.is_selected})'
    def __str__(self):
        obj = { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"is_selected":self.is_selected
			  }
        return json.dumps( obj )

class RazonesSeleccionadas(db.Base):
    __tablename__ = 'razones_seleccionadas'
    
    examen_id = Column(Integer, ForeignKey('examen.id'), primary_key=True)

    exercise_id = Column( String(50) , primary_key=True ) 
    row_id = Column(String(50) , primary_key=True)    
    col_id = Column(String(50) , primary_key=True)
    reason_id = Column(String(50),  primary_key=True)
    
    def __init__(self, examen_id, exercise_id, row_id, col_id, reason_id):
        self.examen_id = examen_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.reason_id = reason_id
    def __repr__(self):
        return f'RazonesSeleccionadas({self.examen_id}, {self.exercise_id}, {self.row_id}, {self.col_id}, {self.reason_id})'
    def __str__(self):
        obj = { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"reason_id":self.reason_id
			  }
        return json.dumps( obj )        

class OtrasRazonesSeleccionadas(db.Base):
    __tablename__ = 'otras_razones_seleccionadas'
    
    examen_id = Column(Integer, ForeignKey('examen.id'), primary_key=True)

    exercise_id = Column( String(50) , primary_key=True ) 
    row_id = Column(String(50) , primary_key=True)    
    col_id = Column(String(50) , primary_key=True)
    otra_razon = Column(String(100), nullable=False)
    
    def __init__(self, examen_id, exercise_id, row_id, col_id, otra_razon):
        self.examen_id = examen_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.otra_razon = otra_razon
    def __repr__(self):
        return f'RazonesSeleccionadas({self.examen_id}, {self.exercise_id}, {self.row_id}, {self.col_id}, {self.otra_razon})'
    def __str__(self):
        obj = { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"otra_razon":self.otra_razon
			  }
        return json.dumps( obj )                

class MovimientosCancelados(db.Base):
    __tablename__ = 'movimientos_cancelados'
    
    examen_id = Column(Integer, ForeignKey('examen.id'), primary_key=True)

    exercise_id = Column( String(50) , primary_key=True ) 
    row_id = Column(String(50) , primary_key=True)    
    
    def __init__(self, examen_id, exercise_id, row_id):
        self.examen_id = examen_id
        self.exercise_id = exercise_id
        self.row_id = row_id

    def __repr__(self):
        return f'RazonesSeleccionadas({self.examen_id}, {self.exercise_id}, {self.row_id})'
    def __str__(self):
        obj = { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id
			  }
        return json.dumps( obj )                        

class ExamenTotales(db.Base):
    __tablename__ = 'examen_totales'
    
    examen_id = Column(Integer, ForeignKey('examen.id'), primary_key=True)

    exercise_id = Column( String(50) , primary_key=True ) 
    row_id = Column(String(50) , primary_key=True)    
    row_total = Column(String(50) , nullable=False)
    
    def __init__(self, examen_id, exercise_id, row_id, row_total):
        self.examen_id = examen_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.row_total = row_total

    def __repr__(self):
        return f'RazonesSeleccionadas({self.examen_id}, {self.exercise_id}, {self.row_id}, {self.row_total})'
    def __str__(self):
        obj = { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
                "row_total":self.row_total
			  }
        return json.dumps( obj )                                