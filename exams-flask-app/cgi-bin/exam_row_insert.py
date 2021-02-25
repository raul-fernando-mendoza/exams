from db import Session
import exam_models 
import logging


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started')    

rows=[
          {
            "id":"primera",
            "label":"I",
            "row_value":2
          },
          {
            "id":"segunda",
            "label":"II",
            "row_value":2
          },
          {
            "id":"tercera",
            "label":"III",
            "row_value":2
          },
          {
            "id":"cuarta",
            "label":"IV",
            "row_value":2
          }


]
if __name__ == '__main__':

    logging.debug("Observacion called")
    session = Session()       
    i = 0;
    for o in rows:
        o = exam_models.ExamRow( type_id = "1", exercise_id="exercise_5" , row_id=rows[i]["id"] , label=rows[i]["label"], ind=i+1, row_value=rows[i]["row_value"])
        i = i + 1
        session.add(o)
    session.commit()
    session.close()

