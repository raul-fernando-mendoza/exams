SELECT /*ac.* , c.* , q.label, aq.graded*/
ac.id, aq.id
FROM exam_impro_ap  a
, exam_impro_ap_parameter ap
, exam_impro_parameter p 
, exam_impro_ap_criteria ac
, exam_impro_criteria c
, exam_impro_ap_question aq
, exam_impro_question q
WHERE a.materia = '15. Sable'
AND ap.exam_impro_parameter_id = p.id
AND ap.exam_impro_ap_id = a.id
AND p.label = 'Ejecución Consolidada'
AND ac.exam_impro_ap_parameter_id = ap.id
AND ac.exam_impro_criteria_id = c.id 
AND aq.exam_impro_ap_criteria_id = ac.id
AND aq.exam_impro_question_id = q.id
AND c.label = 'PRESENTACION BALADI'
ORDER BY c.label

SELECT * FROM exam_impro_ap_question WHERE id IN (3854,3855,3856,3857,3858)

--DELETE FROM exam_impro_ap_question WHERE id IN (3854,3855,3856,3857,3858)

COMMIT;