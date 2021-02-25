import db
from sqlalchemy import Table, Column, Integer, String, Float, Boolean, DateTime, ForeignKey,  ForeignKeyConstraint, UniqueConstraint, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from models import *
import json

class ExamType(db.Base):
    __tablename__ = 'exam_type'
    type_id = Column(Integer, primary_key=True)
    label = Column(String(50), nullable=False)

    UniqueConstraint('label', name='uix_type_label')
    

    exercises = relationship("ExamExercise", cascade="all, delete-orphan")

    def __init__(self, type_id, label):
        self.type_id = type_id
        self.label = label
    def toJSON(self):
        obj = { 
                    "type_id":self.type_id, 
                    "label":self.label, 
                    "exercises":[]
                }
        for o in self.exercises:
            obj["exercises"].append( o.toJSON() )
        return obj   

class ExamExercise(db.Base):
    __tablename__ = 'exam_exercise'
    exercise_id = Column( Integer , primary_key=True )
    type_id = Column(Integer, ForeignKey('exam_type.type_id'))
    label = Column( String(50) , nullable=False) 
    ind =  Column( Integer ,  nullable=False ) 

    UniqueConstraint('type_id', 'label', name='uix_exercise_label')
    

    rows = relationship("ExamRow", cascade="all, delete-orphan")  
    cols = relationship("ExamCol", cascade="all, delete-orphan") 

    
    rowColStatus = relationship("ExamRowColStatus", cascade="all, delete-orphan")
    rowColElements = relationship("ExamRowColElement", cascade="all, delete-orphan") 
    
    def __init__(self, exercise_id, type_id, label, ind):
        self.type_id = type_id
        self.exercise_id = exercise_id
        self.label = label
        self.ind = ind

    def toJSON(self):
        obj= { 
                "exercise_id": self.exercise_id,
                "type_id":self.type_id,
				"label":self.label,
                "ind": self.ind,
                "rows":[],
                "cols":[],
                "rowColStatus":[],
                "rowColElements":[]
			  } 
        for o in self.rows:
            obj["rows"].append( o.toJSON() )
        for o in self.cols:
            obj["cols"].append( o.toJSON() )
        for o in self.rowColStatus:
            obj["rowColStatus"].append( o.toJSON() ) 
        for o in self.rowColElements:
            obj["rowColElements"].append( o.toJSON() )   
        return obj  

class ExamRow(db.Base):
    __tablename__ = 'exam_row'
    row_id = Column(Integer, primary_key=True)
    exercise_id = Column(Integer, ForeignKey('exam_exercise.exercise_id')) 
    
    label = Column(String(50), nullable=False)
    ind = Column(Integer, nullable=False)
    row_value = Column(Float, nullable=False)   

    UniqueConstraint('exercise_id', 'label', name='uix_exercise_row_label') 

    def __init__(self, row_id, exercise_id, label, ind, row_value):
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.label = label
        self.ind = ind
        self.row_value = row_value
       
    def toJSON(self):
        return { 
                   
            "row_id":self.row_id, 
            "exercise_id":self.exercise_id, 
            "label":self.label,
            "ind":self.ind,
            "row_value":self.row_value
        }

class ExamCol(db.Base):
    __tablename__ = 'exam_col'
    col_id = Column(Integer, primary_key=True)
    exercise_id = Column(Integer, ForeignKey('exam_exercise.exercise_id')) 
    
    label = Column(String(50), nullable=False)
    ind = Column(Integer, nullable=False)

    UniqueConstraint('exercise_id', 'label', name='uix_exercise_column_label')

    colElements = relationship("ExamColElement", cascade="all, delete-orphan")

    def __init__(self, col_id, exercise_id, label, ind):
        self.col_id = col_id
        self.exercise_id = exercise_id
        self.label = label
        self.ind = ind
     
    def toJSON(self):
        obj = { 
            "col_id":self.col_id, 
            "exercise_id":self.exercise_id,
            "label":self.label,
            "ind":self.ind,
            "colElements":[]
        }
        for o in self.colElements:
            obj["colElements"].append( o.toJSON() )
        return obj


class ExamColElement(db.Base):
    __tablename__ = 'exam_col_element'
    col_element_id = Column(Integer,  primary_key=True)

    exercise_id = Column( Integer, nullable = False)
    col_id = Column(Integer , nullable = False)
    
    label = Column(String(100),  nullable=False)
    ind = Column(Integer, nullable=False)

    UniqueConstraint('exercise_id', 'col_id', 'label', name='uix_colelement_col_label')

    __table_args__ = (ForeignKeyConstraint([exercise_id, col_id],
                                           [ExamCol.exercise_id, ExamCol.col_id]),
                      {})
    
    def __init__(self, col_element_id, exercise_id, col_id,  label, ind):
        self.col_element_id = col_element_id
        self.exercise_id = exercise_id
        self.col_id = col_id
        self.label = label
        self.ind = ind
    def toJSON(self):
        return { 
                "col_element_id":self.col_element_id,
		        "exercise_id": self.exercise_id,
				"col_id": self.col_id,
                "label":self.label,
                "ind":self.ind
			  }

              

class ExamRowColElement(db.Base):
    __tablename__ = 'exam_row_col_element'
    row_col_element_id = Column(Integer,  primary_key=True)
    exercise_id = Column( Integer, nullable = False)
    row_id = Column(Integer , nullable=False)    
    col_id = Column(Integer , nullable=False)
    label = Column(String(100), nullable=False)
    ind = Column(Integer, nullable=False)

    UniqueConstraint('exercise_id', 'row_id', 'col_id', 'label', name='uix_rowcolelement_row_col_label')

    __table_args__ = (
                        ForeignKeyConstraint([ exercise_id],
                                           [ ExamExercise.exercise_id ]),
                        ForeignKeyConstraint([ exercise_id, row_id],
                                           [ ExamRow.exercise_id, ExamRow.row_id]),
                       ForeignKeyConstraint([ exercise_id, col_id],
                                            [ ExamCol.exercise_id, ExamCol.col_id])
                    )

    def __init__(self, row_col_element_id, exercise_id, row_id, col_id,  label, ind):
        self.row_col_element_id = row_col_element_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.label = label
        self.ind = ind      
    def toJSON(self):
        return { 
                "row_col_element_id":self.row_col_element_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
                "label":self.label,
                "ind":self.ind
			  }

class ExamRowColStatus(db.Base):
    __tablename__ = 'exam_row_col_status'
    exercise_id = Column( Integer , primary_key = True ) 
    row_id = Column(Integer , primary_key = True)    
    col_id = Column(Integer , primary_key = True)
    disabled = Column(Boolean, nullable=False)


    __table_args__ = ( 
                    ForeignKeyConstraint([exercise_id],
                                           [ExamExercise.exercise_id]),
                    ForeignKeyConstraint([exercise_id, row_id],
                                           [ExamRow.exercise_id, ExamRow.row_id]),
                    ForeignKeyConstraint([exercise_id, col_id],
                                           [ ExamCol.exercise_id, ExamCol.col_id])
                    )

    def __init__(self, exercise_id, row_id, col_id, disabled):
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.disabled = disabled
     
    def toJSON(self):
        return { 
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"disabled":self.disabled
			  }
##########################   Exam Execution ##########################

class ExamApplication(db.Base):
    __tablename__ = 'exam_application'
    application_id = Column(Integer, primary_key=True)    
    grado = Column(Integer)
    completado = Column(Boolean)
    fechaApplicacion = Column(DateTime)
    type_id = Column(Integer, ForeignKey('exam_type.type_id'))
    tipoExamen = relationship("ExamType")
    estudiante_id = Column(Integer, ForeignKey('estudiante.id'))
    estudiante = relationship("Estudiante")
    maestro_id = Column(Integer, ForeignKey('maestro.id'))
    maestro = relationship("Maestro") 
    calificacion = Column(Numeric(2,1))

    row_col_selected = relationship("ExamRowColSelected", cascade="all, delete-orphan")  
    row_col_element_selected = relationship("ExamRowColElementSelected", cascade="all, delete-orphan") 
    row_col_text = relationship("ExamRowColText", cascade="all, delete-orphan") 
    row_selected = relationship("ExamRowSelected", cascade="all, delete-orphan") 
    row_total = relationship("ExamRowTotal", cascade="all, delete-orphan") 
    

    def __init__(self, application_id,  type_id, estudiante_id, maestro_id, grado, fechaApplicacion, completado):
        self.application_id = application_id
        self.type_id = type_id
        self.estudiante_id = estudiante_id
        self.maestro_id = maestro_id
        self.grado = grado
        self.fechaApplicacion = fechaApplicacion
        self.completado = completado
    def toJSON(self):
        obj = { "application_id":self.application_id,
		       
				"grado":self.grado,
				"fechaApplicacion":self.fechaApplicacion.strftime("%Y/%m/%d %H:%M:%S"),
				"completado":self.completado,

                "tipoExamen": self.tipoExamen.toJSON(),
				"estudiante": self.estudiante.toJSON(),
				"maestro":self.maestro.toJSON(), 

                "row_col_selected":[],
                "row_col_element_selected":[],
                "row_col_text":[],
                "row_selected":[],
                
                "row_total":[]
			}
        for o in self.row_col_selected:
            obj["row_col_selected"].append( o.toJSON() )

        for o in self.row_col_element_selected:
            obj["row_col_element_selected"].append( o.toJSON() )  

        for o in self.row_col_text:
            obj["row_col_text"].append( o.toJSON() )  

        for o in self.row_selected:
            obj["row_selected"].append( o.toJSON() )   

        for o in self.row_total:
            obj["row_total"].append( o.toJSON() )                                             
        
        return obj


class ExamRowColSelected(db.Base):
    __tablename__ = 'exam_row_col_selected'
    
    application_id = Column(Integer, ForeignKey('exam_application.application_id'), primary_key=True)
    exercise_id = Column( Integer , primary_key=True ) 
    row_id = Column(Integer , primary_key=True)    
    col_id = Column(Integer , primary_key=True)
    is_selected = Column(Boolean, nullable=False)
    
    __table_args__ = ( 
                    ForeignKeyConstraint([application_id],
                                           [ExamApplication.application_id]),
                    ForeignKeyConstraint([exercise_id, row_id],
                                           [ExamRow.exercise_id, ExamRow.row_id]),
                    ForeignKeyConstraint([exercise_id, col_id],
                                           [ ExamCol.exercise_id, ExamCol.col_id])
                    )

    def __init__(self, application_id, exercise_id, row_id, col_id, is_selected):
        self.application_id = application_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.is_selected = is_selected      
    def toJSON(self):
        return { 
                "application_id":self.application_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"is_selected":self.is_selected
			  }
       

class ExamRowColElementSelected(db.Base):
    __tablename__ = 'exam_row_col_element_selected'
    
    application_id = Column(Integer, ForeignKey('exam_application.application_id'), primary_key=True)

    exercise_id = Column( Integer , primary_key=True ) 
    row_id = Column(Integer, primary_key=True)    
    col_id = Column(Integer , primary_key=True)
    reason_id = Column(Integer,  primary_key=True)
    

    __table_args__ = ( 
                    ForeignKeyConstraint([application_id],
                                           [ExamApplication.application_id]),
                    ForeignKeyConstraint([exercise_id, row_id],
                                           [ExamRow.exercise_id, ExamRow.row_id]),
                    ForeignKeyConstraint([exercise_id, col_id],
                                           [ ExamCol.exercise_id, ExamCol.col_id])
                    )

    def __init__(self, application_id, exercise_id, row_id, col_id, reason_id):
        self.application_id = application_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.reason_id = reason_id
    def toJSON(self):
        return { 
                "application_id":self.application_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"reason_id":self.reason_id
			  }
     
       

class ExamRowColText(db.Base):
    __tablename__ = 'exam_row_col_text'
    
    application_id = Column(Integer, ForeignKey('exam_application.application_id'), primary_key=True)

    application_id = Column( Integer , primary_key=True ) 
    exercise_id = Column( Integer , primary_key=True ) 
    row_id = Column(Integer , primary_key=True)    
    col_id = Column(Integer, primary_key=True)
    otra_razon = Column(String(100), nullable=False)
    

    __table_args__ = ( 
                    ForeignKeyConstraint([application_id],
                                           [ExamApplication.application_id]),
                    ForeignKeyConstraint([exercise_id, row_id],
                                           [ExamRow.exercise_id, ExamRow.row_id]),
                    ForeignKeyConstraint([exercise_id, col_id],
                                           [ ExamCol.exercise_id, ExamCol.col_id])
                    )

    def __init__(self, application_id, exercise_id, row_id, col_id, otra_razon):
        self.application_id = application_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.col_id = col_id
        self.otra_razon = otra_razon
    def toJSON(self):
        return { 
                "application_id":self.application_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
				"col_id": self.col_id,
				"otra_razon":self.otra_razon
			  }
       
             

class ExamRowSelected(db.Base):
    __tablename__ = 'exam_row_selected'
    
    application_id = Column(Integer, ForeignKey('exam_application.application_id'), primary_key=True)

    exercise_id = Column( Integer , primary_key=True ) 
    row_id = Column(Integer , primary_key=True)    
    
    __table_args__ = ( 
                    ForeignKeyConstraint([application_id],
                                           [ExamApplication.application_id]),
                    ForeignKeyConstraint([exercise_id, row_id],
                                           [ExamRow.exercise_id, ExamRow.row_id])
                    )

    def __init__(self, application_id, exercise_id, row_id):
        self.application_id = application_id
        self.exercise_id = exercise_id
        self.row_id = row_id

    def toJSON(self):
        return { 
                "application_id":self.application_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id
			  }
          
                       

class ExamRowTotal(db.Base):
    __tablename__ = 'exam_row_total'
    
    application_id = Column(Integer, ForeignKey('exam_application.application_id'), primary_key=True)

    exercise_id = Column( Integer, primary_key=True ) 
    row_id = Column(Integer , primary_key=True)    
    row_total = Column(Float , nullable=False)
    
    __table_args__ = ( 
                    ForeignKeyConstraint([application_id],
                                           [ExamApplication.application_id]),
                    ForeignKeyConstraint([exercise_id, row_id],
                                           [ExamRow.exercise_id, ExamRow.row_id])
                    )

    def __init__(self, application_id, exercise_id, row_id, row_total):
        self.application_id = application_id
        self.exercise_id = exercise_id
        self.row_id = row_id
        self.row_total = row_total

    def toJSON(self):
        return { 
                "application_id":self.application_id,
		        "exercise_id": self.exercise_id,
				"row_id":self.row_id,
                "row_total":self.row_total
			  }
       

if __name__ == '__main__':
    # create this model.
    db.Base.metadata.create_all(db.engine) 
