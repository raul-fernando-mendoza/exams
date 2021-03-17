CREATE OR REPLACE VIEW exam_impro_calificacion AS
SELECT a.id ei_aplication_id, 
a.fechaApplicacion AS fecha,  
a.materia,
t.label as tipo,
CONCAT( e.nombre," ", e.apellidoPaterno, " ", e.apellidoMaterno) AS estudiante, 
email,
CONCAT( m.nombre," ", m.apellidoPaterno, " ", m.apellidoMaterno) AS maestro, 
c.exam_impro_ap_parameter_id,
pt.label AS parametro,  
5 + ROUND( 5 * SUM( q.graded ) / SUM( iq.points ), 1)  AS grade
FROM exam_impro_ap a
JOIN exam_impro_ap_parameter p ON p.exam_impro_ap_id = a.id
JOIN exam_impro_ap_criteria c ON c.exam_impro_ap_parameter_id = p.id
JOIN exam_impro_ap_question q ON q.exam_impro_ap_criteria_id = c.id
JOIN exam_impro_question iq ON iq.id = q.exam_impro_question_id
JOIN estudiante e ON a.estudiante_id = e.id
JOIN exam_impro_type t ON a.exam_impro_type_id = t.id
JOIN exam_impro_parameter pt ON p.exam_impro_parameter_id = pt.id
JOIN maestro m ON p.maestro_id = m.id
GROUP BY a.id,
p.id

ALTER VIEW exam_impro_calificacion
  ADD CONSTRAINT FOREIGN KEY (exam_impro_ap_parameter_id) REFERENCES exam_impro_ap_parameter (id);


CREATE OR REPLACE VIEW exam_impro_ap_calificacion AS
SELECT 
ei_aplication_id,
fecha,
materia,
tipo,
estudiante,
SUM(grade) / COUNT(grade) AS grade
FROM exam_impro_calificacion
GROUP BY ei_aplication_id

SELECT * FROM exam_impro_calificacion

CREATE OR REPLACE VIEW exam_impro_calificacion_det AS
SELECT 
a.fechaApplicacion AS fecha,
a.id, 
a.materia,
t.label tipo,
CONCAT( e.nombre," ", e.apellidoPaterno, " ", e.apellidoMaterno) AS estudiante,
e.email, 
c.exam_impro_ap_parameter_id,
CONCAT( m.nombre," ", m.apellidoPaterno, " ", m.apellidoMaterno) AS maestro, 
pt.label AS parametro, 
iq.label AS question,
5+ q.graded*5 AS calificacion
FROM exam_impro_ap a
JOIN exam_impro_ap_parameter p ON p.exam_impro_ap_id = a.id
JOIN exam_impro_ap_criteria c ON c.exam_impro_ap_parameter_id = p.id
JOIN exam_impro_ap_question q ON q.exam_impro_ap_criteria_id = c.id
JOIN exam_impro_question iq ON iq.id = q.exam_impro_question_id
JOIN estudiante e ON a.estudiante_id = e.id
JOIN exam_impro_type t ON a.exam_impro_type_id = t.id
JOIN exam_impro_parameter pt ON p.exam_impro_parameter_id = pt.id
JOIN maestro m ON p.maestro_id = m.id

