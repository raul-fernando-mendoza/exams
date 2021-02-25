import db
from sqlalchemy import Table, Column, Integer, String, Float, Boolean, DateTime, ForeignKey,  ForeignKeyConstraint, UniqueConstraint, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import json
import models

class ExamImproType(db.Base):
    __tablename__ = 'exam_impro_type'
    id = Column(Integer, primary_key=True) 
    label = Column(String(50), nullable = False)

    UniqueConstraint('id', 'label', name='uix-exam_impro_type-label') 

    parameters = relationship("ExamImproParameter", cascade="all, delete-orphan")     

    def __init__(self, id, label):
        self.id = id
        self.label = label

    def toJSON(self):
        obj = { "id":self.id,
				"label":self.label,
                "parameters":[]
			}
        for o in self.parameters:
            obj["parameters"].append( o.toJSON() )

        return obj

class ExamImproParameter(db.Base):
    __tablename__ = 'exam_impro_parameter'
    id = Column(Integer, primary_key=True) 
    exam_impro_type_id = Column(Integer, ForeignKey('exam_impro_type.id'))

    label = Column(String(50), nullable=False)
    criterias = relationship("ExamImproCriteria", cascade="all, delete-orphan") 

    UniqueConstraint('exam_impro_type_id', 'label', name='uix-exam_impro_parameter-exam_impro_type_id-label') 

    def __init__(self, id, exam_impro_type_id, label):
        self.id = id
        self.exam_impro_type_id = exam_impro_type_id
        self.label = label

    def toJSON(self):
        obj = { "id":self.id,
				"label":self.label,

                "criterias":[],
			}
        for o in self.criterias:
            obj["criterias"].append( o.toJSON() )

        return obj

class ExamImproCriteria(db.Base):
    __tablename__ = 'exam_impro_criteria'
    id = Column(Integer, primary_key=True)  
    exam_impro_parameter_id = Column(Integer, ForeignKey('exam_impro_parameter.id'))

    label = Column(String(50), nullable=False)

    exam_impro_parameter_id = Column(Integer, ForeignKey('exam_impro_parameter.id'))

    UniqueConstraint('exam_impro_parameter_id', 'label', name='uix-exam_impro_criteria-exam_impro_parameter_id-label') 

    questions = relationship("ExamImproQuestion", cascade="all, delete-orphan")  
    def __init__(self, id, exam_impro_parameter_id, label):
        self.id = id
        self.exam_impro_parameter_id = exam_impro_parameter_id
        self.label = label

    def toJSON(self):
        obj = { "id":self.id,
				"label":self.label,
                "questions":[]
			}
        for o in self.questions:
            obj["questions"].append( o.toJSON() )

        return obj

class ExamImproQuestion(db.Base):
    __tablename__ = 'exam_impro_question'
    id = Column(Integer, primary_key=True) 
    exam_impro_criteria_id = Column(Integer, ForeignKey('exam_impro_criteria.id'))

    label = Column(String(50), nullable=False)

    UniqueConstraint('exam_impro_criteria_id', 'label', name='exam_impro_question-exam_impro_criteria_id-label') 

    description = Column(String(500), nullable=False)  
    points = Column(Integer, nullable=False)
    def __init__(self, id, exam_impro_criteria_id, label, description, points):
        self.id = id
        self.exam_impro_criteria_id = exam_impro_criteria_id
        self.label = label
        self.description = description
        self.points = points

    def toJSON(self):
        obj = { "id":self.id,
				"label":self.label,
                "description":self.description,
                "points":self.points
			}
        return obj

class ExamImproApplication(db.Base):
    __tablename__ = 'exam_impro_application'
    id = Column(Integer, primary_key=True)    
    completado = Column(Boolean)
    fechaApplicacion = Column(DateTime)
    
    estudiante_id = Column(Integer, ForeignKey('estudiante.id'), nullable=False)
    estudiante = relationship("Estudiante")

    exam_impro_type_id = Column(Integer, ForeignKey('exam_impro_type.id'), nullable=False)

    parametersApplication = relationship("ExamImproApplicationParameter", cascade="all, delete-orphan")  


    def __init__(self, id,  exam_impro_type_id, estudiante_id, fechaApplicacion, completado):
        self.id = id
        self.exam_impro_type_id = exam_impro_type_id
        self.estudiante_id = estudiante_id
        self.fechaApplicacion = fechaApplicacion
        self.completado = completado
    def toJSON(self):
        obj = { "id":self.id,
				"estudiante": self.estudiante.toJSON(),
				"fechaApplicacion":self.fechaApplicacion.strftime("%Y/%m/%d %H:%M:%S"),
				"completado":self.completado,
                "parametersApplication":[],
			}
        for o in self.parametersApplication:
            obj["parametersApplication"].append( o.toJSON() )

        return obj



class ExamImproApplicationParameter(db.Base):
    __tablename__ = 'exam_impro_application_parameter'
    id = Column(Integer, primary_key=True)
    exam_impro_application_id = Column(Integer, ForeignKey('exam_impro_application.id'))    
    completado = Column(Boolean)

    exam_impro_parameter_id = Column(Integer, ForeignKey('exam_impro_parameter.id'))
    #parameter = relationship("ExamImproParameter")
  
    maestro_id = Column(Integer, ForeignKey('maestro.id'), nullable=True)
    maestro = relationship("Maestro") 

    removed_questions = relationship("ExamImproApplicationRemovedQuestion", cascade="all, delete-orphan")  
    graded_questions = relationship("ExamImproApplicationGradedQuestion", cascade="all, delete-orphan")  

    def __init__(self, id, exam_impro_application_id, exam_impro_parameter_id, maestro_id, completado):
        self.id = id
        self.exam_impro_application_id = exam_impro_application_id
        self.exam_impro_parameter_id = exam_impro_parameter_id
        self.maestro_id = maestro_id
        self.completado = completado
    def toJSON(self):
        obj = { "id":self.id,
                "exam_impro_parameter_id": self.exam_impro_parameter_id,
				"maestro":self.maestro.toJSON() if self.maestro else {}, 
				"completado":self.completado,
                "removed_questions":[],
                "graded_questions":[]
			}
        for o in self.removed_questions:
            obj["removed_questions"].append( o.toJSON() )
        for o in self.graded_questions:
            obj["graded_questions"].append( o.toJSON() )            

        return obj

class ExamImproApplicationRemovedQuestion(db.Base):
    __tablename__ = 'exam_impro_application_removed_question'
    exam_impro_application_parameter_id = Column(Integer, primary_key=True)
    
    exam_impro_question_id = Column(Integer, primary_key=True)

    __table_args__ = (
                        ForeignKeyConstraint([exam_impro_application_parameter_id],
                                            [ExamImproApplicationParameter.id]),
                        ForeignKeyConstraint([exam_impro_question_id],
                                           [ExamImproQuestion.id])
                      )

    def __init__(self, exam_impro_application_parameter_id, exam_impro_question_id):
        self.exam_impro_application_parameter_id = exam_impro_application_parameter_id
        self.exam_impro_question_id = exam_impro_question_id


    def toJSON(self):
        obj = { 
            "exam_impro_application_parameter_id":self.exam_impro_application_parameter_id,
            "exam_impro_question_id":self.exam_impro_question_id
			}
        return obj   

class ExamImproApplicationGradedQuestion(db.Base):
    __tablename__ = 'exam_impro_application_graded_question'
    exam_impro_application_parameter_id = Column(Integer, primary_key=True)
    
    exam_impro_question_id = Column(Integer, primary_key=True)

    __table_args__ = (
                        ForeignKeyConstraint([exam_impro_application_parameter_id],
                                            [ExamImproApplicationParameter.id]),
                        ForeignKeyConstraint([exam_impro_question_id],
                                           [ExamImproQuestion.id])
                      )

    grade = Column(Float, nullable=False)

    def __init__(self, exam_impro_application_parameter_id, exam_impro_question_id, grade):
        self.exam_impro_application_parameter_id = exam_impro_application_parameter_id
        self.exam_impro_question_id = exam_impro_question_id
        self.grade = grade


    def toJSON(self):
        obj = { 
            "exam_impro_application_parameter_id":self.exam_impro_application_parameter_id,
            "exam_impro_question_id":self.exam_impro_question_id,
            "grade":self.grade
			}
        return obj           

if __name__ == '__main__':
    # create this model.
    db.Base.metadata.create_all(db.engine) 