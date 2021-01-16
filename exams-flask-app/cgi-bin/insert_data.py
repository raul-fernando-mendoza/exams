import db
from models import Producto, TipoExamen, Maestro, Estudiante, Examen
import json
def run():
    arroz = Producto('Arroz', 1.25)
    db.session.add(arroz)
    print(arroz.id)
    agua = Producto('Agua', 0.3)
    db.session.add(agua)
    db.session.commit()
    print(agua.id)
    
    examenTecnica = TipoExamen("Tecnica")
    db.session.add(examenTecnica);
    
    claudia = Maestro("Claudia", "Gamboa", "Villa")
    db.session.add(claudia);
    virginia = Maestro("Virginia","Gamboa","Villa")
    db.session.add(virginia)
    
    renata = Estudiante("Renata", "Perez","Moreno")
    db.session.add(renata)
    
    db.session.commit()
    
    
if __name__ == '__main__':
    db.Base.metadata.create_all(db.engine)
    run()
    examenes = db.session.query(Examen).filter_by(estudiante_id=1).all()
    print("results:" + str(examenes) )
    result = []
    for exam in examenes:
       o = {
            "id": exam.id,
            "label": exam.tipoExamen.label,
            "studentName":exam.estudiante.nombre,
            "teacherName":exam.maestro.nombre,
            "grade": exam.grado,
            "completado": exam.completado,
            "applicationDate": exam.fechaApplicacion
            }
       result.append(o)
    print( result );
