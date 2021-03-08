CREATE OR REPLACE VIEW exam_impro_calificacion AS
SELECT a.id as exam_impro_ap_id, p.id AS exam_impro_ap_parameter_id, ROUND( 10 * SUM( q.graded ) / SUM( iq.points ), 1)  AS grade
FROM exam_impro_ap a
JOIN exam_impro_ap_parameter p ON p.exam_impro_ap_id = a.id
JOIN exam_impro_ap_criteria c ON c.exam_impro_ap_parameter_id = p.id
JOIN exam_impro_ap_question q ON q.exam_impro_ap_criteria_id = c.id
JOIN exam_impro_question iq ON iq.id = q.exam_impro_question_id
GROUP BY a.id, p.id

SELECT * FROM exam_impro_calificacion

