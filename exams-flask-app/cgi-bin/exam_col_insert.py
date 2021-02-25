from db import Session
import exam_models 
import logging


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started')    
col = [
          {"id":"crotalos"},
          {"id":"arreglo"},
          {"id":"gesto"},
          {"id":"port_de_bras"},
          {"id":"shimmy"},
          {"id":"secuencia"},
          {"id":"fluidez"},
          {"id":"transiciones"}  
]
col_label=[


    {"text": 'Crot Contra tiempo'},
    {"text": 'Crotalos Arreglo'},
    {"text": 'Rostro-Gesto'},
    {"text": 'Port de bras y Dedos'},
    {"text": 'Shimmy (R,I,U)'},
    {"text": 'Serie Inicio y final'},
    {"text": 'Fluidez en serie'},
    {"text": 'Transicion en serie'},
 
]
if __name__ == '__main__':

    logging.debug("Observacion called")
    session = Session()       
    i = 0;
    for o in col:
        o = exam_models.ExamCol( type_id = "1", exercise_id="exercise_5" , col_id=col[i]["id"] , label=col_label[i]["text"], ind=i+1)
        i = i + 1
        session.add(o)
    session.commit()
    session.close()

