UPDATE exam_impro_parameter 
JOIN (
SELECT id, exam_impro_type_id , label, ROW_NUMBER() over ( PARTITION BY exam_impro_type_id ORDER BY id ) AS indice
FROM exam_impro_parameter 
)param
SET exam_impro_parameter.idx = param.indice - 1
WHERE exam_impro_parameter.id = param.id

COMMIT;

UPDATE exam_impro_question 
JOIN (
SELECT id, exam_impro_criteria_id , label, ROW_NUMBER() over ( PARTITION BY exam_impro_criteria_id ORDER BY id ) AS indice
FROM exam_impro_question 
)question
SET exam_impro_question.idx = question.indice-1
WHERE exam_impro_question.id = question.id
