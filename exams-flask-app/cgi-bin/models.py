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
        return f'Estudiante({self.nombre}, {self.apellidoPaterno},{self.apellidoMaterno})'
    def toJSON(self):
        return { "id":self.id,
                "nombre":self.nombre,
				"apellidoPaterno":self.apellidoPaterno,
				"apellidoMaterno":self.apellidoMaterno
			}
        
        
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
        return f'Maestro({self.nombre}, {self.apellidoPaterno},{self.apellidoMaterno})'        
    def toJSON(self):
        return { "id":self.id,
                "nombre":self.nombre,
				"apellidoPaterno":self.apellidoPaterno,
				"apellidoMaterno":self.apellidoMaterno
			}
        
        
class TipoExamen(db.Base):
    __tablename__ = 'tipo_examen'
    id = Column(Integer, primary_key=True)
    label = Column(String(50), nullable=False)
    def __init__(self, label):
        self.label = label
    def __repr__(self):
        return f'TipoExamen({self.label})'        
    def toJSON(self):
        return { 
                    "id":self.id, 
                    "label":self.label 
                }
        

        
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

    examen_observaciones = relationship("ExamenObservaciones", cascade="all, delete-orphan")  
    razones_seleccionadas = relationship("RazonesSeleccionadas", cascade="all, delete-orphan") 
    otras_razones_seleccionadas = relationship("OtrasRazonesSeleccionadas", cascade="all, delete-orphan") 
    movimientos_cancelados = relationship("MovimientosCancelados", cascade="all, delete-orphan") 
    examen_totales = relationship("ExamenTotales", cascade="all, delete-orphan") 
    

    def __init__(self, id,  exam_type_id, estudiante_id, maestro_id, grado, fechaApplicacion, completado):
        self.id = id
        self.exam_type_id = exam_type_id
        self.estudiante_id = estudiante_id
        self.maestro_id = maestro_id
        self.grado = grado
        self.fechaApplicacion = fechaApplicacion
        self.completado = completado
    def __repr__(self):
        return f'Examen({self.id}, {self.exam_type_id},{self.estudiante_id})'
    def toJSON(self):
        

        obj = { "id":self.id,
		       
				"grado":self.grado,
				"fechaApplicacion":self.fechaApplicacion.strftime("%Y/%m/%d %H:%M:%S"),
				"completado":self.completado,

                "tipoExamen": self.tipoExamen.toJSON(),
				"estudiante": self.estudiante.toJSON(),
				"maestro":self.maestro.toJSON(), 

                "examen_observaciones":[],
                "razones_seleccionadas":[],
                "otras_razones_seleccionadas":[],
                "movimientos_cancelados":[],
                
                "examen_totales":[]
			}
        for o in self.examen_observaciones:
            obj["examen_observaciones"].append( o.toJSON() )

        for o in self.razones_seleccionadas:
            obj["razones_seleccionadas"].append( o.toJSON() )  

        for o in self.otras_razones_seleccionadas:
            obj["otras_razones_seleccionadas"].append( o.toJSON() )  

        for o in self.movimientos_cancelados:
            obj["movimientos_cancelados"].append( o.toJSON() )   

        for o in self.examen_totales:
            obj["examen_totales"].append( o.toJSON() )                                             
        
        return obj


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
    def toJSON(self):
        return { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"is_selected":self.is_selected
			  }
       

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
    def toJSON(self):
        return { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"reason_id":self.reason_id
			  }
     
       

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
    def toJSON(self):
        return { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"otra_razon":self.otra_razon
			  }
       
             

class MovimientosCancelados(db.Base):
    __tablename__ = 'movimientos_cancelados'
    
    examen_id = Column(Integer, ForeignKey('examen.id'), primary_key=True)

    exercise_id = Column( String(50) , primary_key=True ) 
    row_id = Column(String(50) , primary_key=True)    
    
    def __init__(self, examen_id, exercise_id, row_id):
        self.examen_id = examen_id
        self.exercise_id = exercise_id
        self.row_id = row_id

    def toJSON(self):
        return { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id
			  }
          
                       

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

    def toJSON(self):
        return { 
                "examen_id":self.examen_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
                "row_total":self.row_total
			  }
       
                               
user_role = Table('user_role', db.Base.metadata,
    Column('left_id',Integer, ForeignKey('user.user_id')),
    Column('right_id',Integer, ForeignKey('role.role_id'))
)

class User(db.Base):
    __tablename__ = 'user'
    user_id = Column(Integer,  primary_key=True)
    user_name = Column( String(50) , primary_key=True ) 

    password = Column(String(50) , nullable=False)    
    roles = relationship("Role",
                    secondary=user_role)
    
    def __init__(self, user_id, password):
        self.user_id = user_id
        self.password = password

    def toJSON(self):
        return { 
                "user_id":self.user_id
			  }
        

class Role(db.Base):
    __tablename__ = 'role'

    role_id = Column(Integer, primary_key=True)
    role_name = Column(String(50), primary_key=True)  
 
    def __init__(self, role_id):
        self.role_id = role_id

    def toJSON(self):
        return { 
                "role_id":self.role_id
			  }
        

class Token(db.Base):
    __tablename__ = 'token'

    key = Column(String(50), primary_key=True)
    expirationDate = Column(DateTime)
    user_id = Column(Integer, nullable=False )
 
    def __init__(self, key, expirationDate, user_id):
        self.key = key
        self.expirationDate = expirationDate.strftime("%Y/%m/%d %H:%M:%S")
        self.user_id = user_id

    def toJSON(self):
        return { 
                "key":self.key,
                "user_id":self.keys,
                "expirationDate":self.expirationDate
			  }
        

if __name__ == '__main__':
    # create this model.
    db.Base.metadata.create_all(db.engine)       