CREATE OR REPLACE VIEW thoth.organizations
AS (
  SELECT
    id,
	JSON_VALUE(value.organization_name) organization_name,
	cast( JSON_VALUE(value.isDeleted) as BOOLEAN) isDeleted,
	cast( JSON_VALUE(value.isDefaultOrganization) as BOOLEAN) isDefaultOrganization
  FROM
    `thoth.organizations_snapshot`
  where valid_to is null
);

select * from thoth.organizations

CREATE OR REPLACE VIEW thoth.examGrades
AS (
  SELECT
    id,
  JSON_VALUE(value.organization_id) organization_id, 
  JSON_VALUE(value.exam_id) exam_id,
  JSON_VALUE(value.materia_id) materia_id,
  cast( JSON_VALUE(value.isCompleted) as BOOLEAN) isCompleted,
  parse_datetime('%Y-%m-%d %H:%M:%E*S', json_value(value, '$.applicationDate')) as applicationDate,
  cast( JSON_VALUE(value.applicationDay) as NUMERIC) applicationDay,
  cast( JSON_VALUE(value.applicationMonth) as NUMERIC) applicationMonth,
  cast( JSON_VALUE(value.applicationYear) as NUMERIC) applicationYear,
  JSON_VALUE(value.student_uid) student_uid,
  JSON_VALUE(value.title) as title,
  JSON_VALUE(value.expression) as expression,
  JSON_VALUE(value.level) level,
  cast( JSON_VALUE(value.score) as NUMERIC) score, 
  cast( JSON_VALUE(value.isDeleted) AS BOOLEAN) isDeleted, 
  cast( JSON_VALUE(value.isReleased) as BOOLEAN) isReleased, 
  cast( JSON_VALUE(value.isApproved) AS BOOLEAN) isApproved, 
  cast( JSON_VALUE(value.isWaiver) AS BOOLEAN) isWaiver,
  parse_datetime('%Y-%m-%d %H:%M:%E*S', json_value(value, '$.created_on')) as created_on,
  parse_datetime('%Y-%m-%d %H:%M:%E*S', json_value(value, '$.updated_on')) as updated_on
  FROM
    `thoth.examGrades_snapshot`
  where valid_to is null and cast( JSON_VALUE(value.isDeleted) as BOOLEAN)  = false
);

select * from thoth.examGrades limit 100

CREATE OR REPLACE VIEW thoth.parameterGrades
AS (
  SELECT
  JSON_VALUE(parameter.id) id,
  id as exam_grade_id,

  JSON_VALUE(parameter.organization_id) organization_id,  
  CAST( JSON_VALUE(parameter.idx) as NUMERIC ) idx, 
  JSON_VALUE(parameter.label) label, 
  JSON_VALUE(parameter.description) description, 
  JSON_VALUE(parameter.scoreType) scoreType, 
  CAST( JSON_VALUE(parameter.score) as NUMERIC ) score, 
  JSON_VALUE(parameter.evaluator_uid) evaluator_uid, 
  parse_datetime("%Y-%m-%d %H:%M:%S", json_value(parameter, '$.applicationDate')) as applicationDate,
  CAST( JSON_VALUE(parameter.applicationDay) as NUMERIC ) applicationDay,
  CAST( JSON_VALUE(parameter.applicationMonth) as NUMERIC ) applicationMonth,
  CAST( JSON_VALUE(parameter.applicationYear) as NUMERIC ) applicationYear,

  CAST( JSON_VALUE(parameter.isCompleted) as BOOL) isCompleted,
  JSON_VALUE(parameter.evaluator_comment) as evaluator_comment,
  JSON_VALUE(parameter.commentSoundPath) as commentSoundPath,
  JSON_VALUE(parameter.commentSoundUrl) as commentSoundUrl,

  CAST( JSON_VALUE(parameter.version) as NUMERIC ) version,
  CAST( JSON_VALUE(parameter.isCurrentVersion) as BOOL ) isCurrentVersion,
  JSON_VALUE(parameter.parameterGradeOriginal) as parameterGradeOriginal
  
  FROM
    `thoth.examGrades_snapshot`, UNNEST(JSON_EXTRACT_ARRAY(value.parameterGrades , '$')) parameter
  where valid_to is null and cast( JSON_VALUE(value.isDeleted) as BOOLEAN)  = false
);

select * from thoth.parameterGrades limit 100

CREATE OR REPLACE VIEW thoth.criteriaGrades
AS (
  SELECT 
  JSON_VALUE(criteria.idx) id,
  id as exam_grade_id,
  JSON_VALUE(parameter.id) parameter_grade_id ,
  CAST( JSON_VALUE(criteria.idx) as NUMERIC ) idx, 
  JSON_VALUE(criteria.label) label, 
  JSON_VALUE(criteria.description) description, 
  CAST( JSON_VALUE(criteria.score) as NUMERIC ) score,   
  CAST( JSON_VALUE(criteria.isSelected) as BOOL) isSelected,
  CAST( JSON_VALUE(criteria.earnedPoints) as NUMERIC) earnedPoints,
  CAST( JSON_VALUE(criteria.availablePoints) as NUMERIC) availablePoints
    FROM
    `thoth.examGrades_snapshot`
  , UNNEST(JSON_EXTRACT_ARRAY(value.parameterGrades)) parameter
  , UNNEST(JSON_EXTRACT_ARRAY(parameter.criteriaGrades )) criteria
  where valid_to is null and cast( JSON_VALUE(value.isDeleted) as BOOLEAN)  = false
)

select * from thoth.criteriaGrades

CREATE OR REPLACE VIEW thoth.materias
AS (
  SELECT 
  JSON_VALUE(value.id) id,
  JSON_VALUE(value.materia_name) materia_name,
  JSON_VALUE(value.organization_id) organization_id  
  FROM
    `thoth.materias_snapshot` materia 
  where valid_to is null		
)
select * from thoth.materias

CREATE OR REPLACE VIEW thoth.materias_exams
AS (
  SELECT 
  JSON_VALUE(exams.id) id,
  JSON_VALUE(value.id) materia_id,
  JSON_VALUE(exams.label) exam_label,  
  JSON_VALUE(exams.isDeleted) isDeleted
  FROM
    `thoth.materias_snapshot` materia
    , UNNEST(JSON_EXTRACT_ARRAY(value.exams)) exams 
  where valid_to is null	
)

select * from thoth.materias_exams limit 100