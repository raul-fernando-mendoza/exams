{"applicationDate":"2021-08-09",
"certificate_url":"https://storage.googleapis.com/certificates.raxacademy.com/Iqrl5hiDk5EO6XzvSFuP.jpg",
"completed":true,
"course":"Técnica II",
"exam_id":"5CcaaDy9BrKBPkVLtCy7",
"exam_label":"COORDINACION Y RESISTENCIA",
"expression":null,
"id":"Iqrl5hiDk5EO6XzvSFuP",
"score":9,
"student_name":"Melina Díaz",
"student_uid":"V9J8BmER4iR8qvQdy7AwYqoGCc73",
"title":"Coordinación y Resistencia","updateon":"2021-08-14"}

drop view exams.examGrades

create view celtic-bivouac-307316.exams.examGrades as 
SELECT 
JSON_EXTRACT_SCALAR(data, "$.id") AS examGrades_id,
JSON_EXTRACT_SCALAR(data, "$.applicationDate") AS applicationDate,
JSON_EXTRACT_SCALAR(data, "$.certificate_url") AS certificate_url,
JSON_EXTRACT_SCALAR(data, "$.completed") AS completed,
JSON_EXTRACT_SCALAR(data, "$.course") AS materia,
JSON_EXTRACT_SCALAR(data, "$.exam_label") AS exam_label,
JSON_EXTRACT_SCALAR(data, "$.expression") AS expression,
ROUND (SAFE_CAST( JSON_EXTRACT_SCALAR(data, "$.score") AS NUMERIC ) , 2) AS exam_score, 
JSON_EXTRACT_SCALAR(data, "$.student_name") AS student_name,
JSON_EXTRACT_SCALAR(data, "$.student_uid") AS student_uid,
JSON_EXTRACT_SCALAR(data, "$.title") AS title
FROM celtic-bivouac-307316.exams.examGrades_raw_latest

select examGrades_id, applicationDate, exam_label, materia, title,   expression,  exam_score, student_name, completed, 
FROM celtic-bivouac-307316.exams.examGrades

DROP VIEW exams.parameterGrades

create view celtic-bivouac-307316.exams.parameterGrades as 
SELECT 
JSON_EXTRACT_SCALAR(data, "$.id") AS parameterGrades_id,
JSON_EXTRACT_SCALAR(data, "$.idx") AS parameterGrades_idx,
JSON_EXTRACT_SCALAR(data, "$.examGrades_id") AS examGrades_id,
JSON_EXTRACT_SCALAR(data, "$.label") AS parameter_label,
JSON_EXTRACT_SCALAR(data, "$.description") AS parameter_description,
JSON_EXTRACT_SCALAR(data, "$.evaluator_name") AS evaluator_name,
JSON_EXTRACT_SCALAR(data, "$.evaluator_comment") AS evaluator_comment,
JSON_EXTRACT_SCALAR(data, "$.isSelected") AS isSelected,
JSON_EXTRACT_SCALAR(data, "$.completed") AS parameter_completed,
ROUND (SAFE_CAST( JSON_EXTRACT_SCALAR(data, "$.score") AS NUMERIC ) , 2) AS parameter_score, 
FROM celtic-bivouac-307316.exams.parameterGrades_raw_latest

select parameterGrades_id, parameterGrades_idx, parameter_label, parameter_description, parameter_completed, evaluator_name,  evaluator_comment,  parameter_score
from celtic-bivouac-307316.exams.parameterGrades

{"description":"",
"id":"B71Vtp5AM5xXnktY2GSh",
"idx":1,
"isSelected":true,
"label":"SEC.II «CADERAS LATERALES Y RECOGIDAD»",
"parameterGrades_id":"7g7HLziZ48hqrqDd16pU",
"score":null}

drop view exams.criteriaGrades
create view celtic-bivouac-307316.exams.criteriaGrades as 
SELECT 
JSON_EXTRACT_SCALAR(data, "$.id") AS criteriaGrades_id,
JSON_EXTRACT_SCALAR(data, "$.idx") AS criteriaGrades_idx,
JSON_EXTRACT_SCALAR(data, "$.parameterGrades_id") AS parameterGrades_id,
JSON_EXTRACT_SCALAR(data, "$.description") AS criteria_description,
JSON_EXTRACT_SCALAR(data, "$.isSelected") AS criteria_isSelected,
JSON_EXTRACT_SCALAR(data, "$.label") AS criteria_label,
ROUND (SAFE_CAST( JSON_EXTRACT_SCALAR(data, "$.score") AS NUMERIC ) , 2) AS criteria_score, 
FROM celtic-bivouac-307316.exams.criteriaGrades_raw_latest

select criteriaGrades_id, criteriaGrades_idx, criteria_label, criteria_description, criteria_score
from celtic-bivouac-307316.exams.criteriaGrades 

{"criteriaGrades_id":"B71Vtp5AM5xXnktY2GSh",
"description":"— Uniformidad.\n— Mantenerlo durante todo el ejercicio.\n— Comodidad al hacerlo.\n—  Alternar piernas.\n— Extender piernas. no plié.",
"hasMedal":false,
"id":"h8YioLsna3a70fV89o4m",
"idx":5,"isGraded":true,
"label":"Shimmy (R.I.U)",
"medalDescription":null
,"missingElements":null,
"score":0.5,
"updateon":"2021-08-14"}

drop view exams.aspectGrades

create view celtic-bivouac-307316.exams.aspectGrades as 
SELECT 
JSON_EXTRACT_SCALAR(data, "$.id") AS aspectGrades_id,
JSON_EXTRACT_SCALAR(data, "$.idx") AS aspectGrades_idx,
JSON_EXTRACT_SCALAR(data, "$.criteriaGrades_id") AS criteriaGrades_id,
JSON_EXTRACT_SCALAR(data, "$.description") AS aspectGrades_description,
JSON_EXTRACT_SCALAR(data, "$.hasMedal") AS hasMedal,
JSON_EXTRACT_SCALAR(data, "$.label") AS aspectGrades_label,
JSON_EXTRACT_SCALAR(data, "$.medalDescription") AS medalDescription,
JSON_EXTRACT_SCALAR(data, "$.missingElements") AS missingElements,
ROUND (SAFE_CAST( JSON_EXTRACT_SCALAR(data, "$.score") AS NUMERIC ) , 2) * 10 aspectGrades_score, 
JSON_EXTRACT_SCALAR(data, "$.isGraded") AS isGraded
FROM celtic-bivouac-307316.exams.aspectGrades_raw_latest

select aspectGrades_id, aspectGrades_idx, aspectGrades_label, aspectGrades_description, medalDescription, missingElements, aspectGrades_score
from celtic-bivouac-307316.exams.aspectGrades

drop view exams.examsAll

create view celtic-bivouac-307316.exams.examsAll as 
select 
examGrades.examGrades_id, applicationDate, exam_label, materia, title,   expression,  exam_score, student_name, completed, 
parameterGrades.parameterGrades_id, parameterGrades_idx, parameter_label, parameter_description, parameter_completed, evaluator_name,  evaluator_comment,  parameter_score,
criteriaGrades.criteriaGrades_id, criteriaGrades_idx, criteria_label, criteria_description, criteria_score,
aspectGrades_id, aspectGrades_idx, aspectGrades_label, aspectGrades_description, COALESCE(medalDescription,""), COALESCE(missingElements,""), aspectGrades_score
FROM celtic-bivouac-307316.exams.examGrades as examGrades,
celtic-bivouac-307316.exams.parameterGrades as parameterGrades,
celtic-bivouac-307316.exams.criteriaGrades as criteriaGrades,
celtic-bivouac-307316.exams.aspectGrades as aspectGrades
where parameterGrades.examGrades_id = examGrades.examGrades_id
and criteriaGrades.parameterGrades_id = parameterGrades.parameterGrades_id 
and aspectGrades.criteriaGrades_id = criteriaGrades.criteriaGrades_id

select * from celtic-bivouac-307316.exams.examsAll