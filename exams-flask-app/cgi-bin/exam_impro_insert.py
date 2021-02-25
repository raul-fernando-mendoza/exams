from db import Session
from exam_impro_model import ExamImproCriteria, ExamImproQuestion, ExamImproApplication, ExamImproApplicationParameter, ExamImproApplicationRemovedQuestion, ExamImproApplicationGradedQuestion
import datetime


try:
    s = Session()
    """
    s.add( ExamImproCriteria(1, 1, "MOVIMIENTO CORPORAL" ) )  
    s.add( ExamImproQuestion( None, 1, "Posicione y colocación" ,"Alineación y colocación adecuadas, posiciones precisas",1) )
    s.add( ExamImproQuestion( None, 1, "Balance" ,"Equilibrio entre baile y acrobacias para conseguir movimientos eficaces.",1) )
    s.add( ExamImproQuestion( None, 1, "Equilibrio" ,"Firmeza y solidez del cuerpo sobre su base de apoyo.",1) )
    s.add( ExamImproQuestion( None, 1, "Movimientos Ondulatorios" ,"Elongación, amplitud, visibilidad y dirección.",1) )
    s.add( ExamImproQuestion( None, 1, "Movimientos de Impacto." ,"Golpes, dirigidos, fuertes, repentinos, con remates.",1) )
    s.add( ExamImproQuestion( None, 1, "Movimientos de transición" ,"Mostrar naturalidad en la transicion entre un movimiento y otro.",1) )
    s.add( ExamImproQuestion( None, 1, "Desplazamientos y Trayectoria" ,"Sentido de orientación en el espacio",1) )
    

    s.add( ExamImproCriteria(2, 1, "MUSICOLOGIA" ) )
    s.add( ExamImproQuestion( None, 2, "Instrumentación" ,"movimientos acordes con los instrumentos",1) )
    s.add( ExamImproQuestion( None, 2, "Sentido rítmico" ,"Percibe la sucesión armoniosa y acompasada de la música.",1) )

    s.add( ExamImproCriteria(3, 1, "TEMPORALIDAD Y ESCTRUCTURA" ) )
    s.add( ExamImproQuestion( None, 3, "Tema" ,"Asunto o materia a tratar en la obra.",1) )
    s.add( ExamImproQuestion( None, 3, "Orden" ,"Planificación del baile.",1) )


    s.add( ExamImproCriteria(4, 1, "ESPACIO" ) )
    s.add( ExamImproQuestion( None, 4, "Espacio personal" ,"Es el que ocupa el cuerpo de la bailarina",1) )
    s.add( ExamImproQuestion( None, 4, "Espacio escenico" ,"Uso del espacio físico ",1) )
    
    s.add( ExamImproCriteria(5, 2, "EXPRESIÓN CORPORAL" ) )  
    s.add( ExamImproQuestion( None, 5, "Posicione y colocación" ,"Alineación y colocación adecuadas, posiciones precisas",1) )
    s.add( ExamImproQuestion( None, 5, "Equilibrio" ,"Firmeza y solidez del cuerpo sobre su base de apoyo",1) )
    s.add( ExamImproQuestion( None, 5, "Movimientos Ondulatorios." ,"Elongación, amplitud, visibilidad y dirección.",1) )
    s.add( ExamImproQuestion( None, 5, "Movimientos de Impacto." ,"Golpes, dirigidos, fuertes, repentinos, con remates.",1) )
    s.add( ExamImproQuestion( None, 5, "Distensión" ,"Eliminar tensión y fatiga mediante el dominio corporal",1) )
    s.add( ExamImproQuestion( None, 5, "Movimientos de transición" ,"Mostrar naturalidad en la transicion entre un movimiento y otro.",1) )
    s.add( ExamImproQuestion( None, 5, "Mirada" ,"proyección, contacto visual, definición",1) )

    s.add( ExamImproCriteria(6, 2, "EXPRESIÓN FACIAL" ) )
    s.add( ExamImproQuestion( None, 6, "Mirada" ,"proyección, contacto visual, definición",1) )
    s.add( ExamImproQuestion( None, 6, "Sonrisa expresiva" ,"Para expresar diversos grados de placer, regocijo, alegria, felicidad, etc. (Ligeras, normales, amplias)",1) )
    

    s.add( ExamImproCriteria(7, 2, "IMAGEN CORPORAL" ) )
    s.add( ExamImproQuestion( None, 7, "Percepción del cuerpo" ,"Se percibe cómoda con su apariencia",1) )
    s.add( ExamImproQuestion( None, 7, "Percepción motríz" ,"Se percibe cómoda con los movimientos",1) )

    s.add( ExamImproCriteria(8, 2, "Rasgos de PERSONALIDAD" ) )
    s.add( ExamImproQuestion( None, 8, "Disciplina" ,"Alta capacidad de atención alas entradas y salidas del escenario, así como a las normas y principios de la danza.",1) )
    s.add( ExamImproQuestion( None, 8, "Capacidad de concentración" ,"Buena capacidad de concentración y razonamiento",1) )
    s.add( ExamImproQuestion( None, 8, "Memoria" ,"Buena capacidad e recordar pasos, ideas, ",1) )
    s.add( ExamImproQuestion( None, 8, "Perseverancia" ,"Capacidad de afrontar contratiempos",1) )
   
    s.add( ExamImproApplication(1, 1, 1, datetime.datetime(2021,1,1) , False) )
    s.add( ExamImproApplicationParameter(id=None, exam_impro_application_id=1, exam_impro_parameter_id=1, maestro_id=1, completado=False) )
    s.add( ExamImproApplicationParameter(id=None, exam_impro_application_id=1, exam_impro_parameter_id=2, maestro_id=2, completado=False) )
     
    s.add( ExamImproApplicationRemovedQuestion( exam_impro_application_parameter_id=3, exam_impro_question_id=12) )
    

    s.add( ExamImproApplicationGradedQuestion( exam_impro_application_parameter_id=3, exam_impro_question_id=13,grade=1) )
    """

 

    s.commit()
except Exception as e:
    s.rollback()
    print( str(e) ) 
