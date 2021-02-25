from db import Session
from models import ExamenObservaciones
import logging


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started')    

examen_observaciones=[
        {
            "col_id": "pies",
            "examen_id": 16,
            "exercise_id": "exercise_1",
            "is_selected": True,
            "row_id": "primera"
        },
        {
            "col_id": "shimmi",
            "examen_id": 16,
            "exercise_id": "exercise_1",
            "is_selected": True,
            "row_id": "primera"
        },
        {
            "col_id": "pies",
            "examen_id": 16,
            "exercise_id": "exercise_1",
            "is_selected": True,
            "row_id": "quinta"
        },
        {
            "col_id": "espalda",
            "examen_id": 16,
            "exercise_id": "exercise_2",
            "is_selected": True,
            "row_id": "fenix"
        },
        {
            "col_id": "espalda",
            "examen_id": 16,
            "exercise_id": "exercise_2",
            "is_selected": True,
            "row_id": "primera"
        },
        {
            "col_id": "pies",
            "examen_id": 16,
            "exercise_id": "exercise_2",
            "is_selected": True,
            "row_id": "primera"
        },
        {
            "col_id": "espalda",
            "examen_id": 16,
            "exercise_id": "exercise_2",
            "is_selected": True,
            "row_id": "segunda"
        },
        {
            "col_id": "shimmy",
            "examen_id": 16,
            "exercise_id": "exercise_3",
            "is_selected": True,
            "row_id": "caderas"
        },
        {
            "col_id": "caracteristica",
            "examen_id": 16,
            "exercise_id": "exercise_4",
            "is_selected": True,
            "row_id": "circulo_grande"
        },
        {
            "col_id": "secuencia",
            "examen_id": 16,
            "exercise_id": "exercise_5",
            "is_selected": True,
            "row_id": "primera"
        },
        {
            "col_id": "secuencia",
            "examen_id": 16,
            "exercise_id": "exercise_5",
            "is_selected": True,
            "row_id": "tercera"
        }


]
if __name__ == '__main__':

    logging.debug("Observacion called")
    session = Session()       
    
    for o in examen_observaciones:
        print(o["exercise_id"])
        o = ExamenObservaciones( examen_id=o["examen_id"], exercise_id=o["exercise_id"], row_id=o["row_id"], col_id=o["col_id"], is_selected=o["is_selected"] )
        session.add(o)
    

 
    session.commit()
    session.close()

