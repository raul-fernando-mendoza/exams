CREATE OR REPLACE VIEW exam_impro_calificacion AS
SELECT a.id ei_aplication_id, 
a.fechaApplicacion AS fecha,  
a.materia,
t.label as tipo,
nvl( e.displayName, e.email) AS estudiante,
nvl(m.displayName,m.email) AS maestro, 
c.exam_impro_ap_parameter_id,
pt.label AS parametro,  
4.5 + ROUND( 5.5 * (SUM( q.graded ) / SUM( iq.points) ), 1)  AS calificacion,
p.comentario
FROM exam_impro_ap a
JOIN exam_impro_ap_parameter p ON p.exam_impro_ap_id = a.id
JOIN exam_impro_ap_criteria c ON c.exam_impro_ap_parameter_id = p.id
JOIN exam_impro_ap_question q ON q.exam_impro_ap_criteria_id = c.id
JOIN exam_impro_question iq ON iq.id = q.exam_impro_question_id
JOIN user as e ON a.estudiante_uid = e.uid
JOIN exam_impro_type t ON a.exam_impro_type_id = t.id
JOIN exam_impro_parameter pt ON p.exam_impro_parameter_id = pt.id
JOIN user as m ON p.maestro_uid = m.uid
GROUP BY a.id,
p.id


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
nvl( e.displayName, e.email) AS estudiante,
c.exam_impro_ap_parameter_id,
nvl(m.displayName,m.email) AS maestro, 
pt.label AS parametro, 
cr.label AS criterio,
iq.label AS aspecto,
4.5 + q.graded*5.5 AS calificacion
FROM exam_impro_ap a
JOIN exam_impro_ap_parameter p ON p.exam_impro_ap_id = a.id
JOIN exam_impro_ap_criteria c ON c.exam_impro_ap_parameter_id = p.id
JOIN exam_impro_ap_question q ON q.exam_impro_ap_criteria_id = c.id
JOIN exam_impro_question iq ON iq.id = q.exam_impro_question_id
JOIN user as e ON a.estudiante_uid = e.uid
JOIN exam_impro_type t ON a.exam_impro_type_id = t.id
JOIN exam_impro_parameter pt ON p.exam_impro_parameter_id = pt.id
JOIN exam_impro_criteria cr ON c.exam_impro_criteria_id = cr.id
JOIN user as m ON p.maestro_uid = m.uid

