CREATE OR REPLACE VIEW thoth-qa.thoth.exam_grades
AS (
  SELECT
    id,
  JSON_VALUE(value.organization_id) organization_id, 
  JSON_VALUE(value.exam_id) exam_id,
  JSON_VALUE(value.materia_id) materia_id,
  cast( JSON_VALUE(value.isCompleted) as BOOLEAN) isCompleted,
  parse_datetime("%Y-%m-%d %H:%M:%S", json_value(value, '$.applicationDate')) as applicationDate,
  JSON_VALUE(value.applicationDay) applicationDay,
  JSON_VALUE(value.applicationMonth) applicationMonth,
  JSON_VALUE(value.applicationYear) applicationYear,
  JSON_VALUE(value.student_uid) student_uid,
  JSON_VALUE(value.title) as title,
  JSON_VALUE(value.expression) as expression,
  JSON_VALUE(value.level) level,
  cast( JSON_VALUE(value.score) as NUMERIC) score, 
  cast( JSON_VALUE(value.isDeleted) AS BOOLEAN) isDeleted, 
  cast( JSON_VALUE(value.isReleased) as BOOLEAN) isReleased, 
  cast( JSON_VALUE(value.isApproved) AS BOOLEAN) isApproved, 
  cast( JSON_VALUE(value.isWaiver) AS BOOLEAN) isWaiver,
  parse_datetime("%Y-%m-%d %H:%M:%S", json_value(value, '$.created_on')) as created_on,
  parse_datetime("%Y-%m-%d %H:%M:%S", json_value(value, '$.updated_on')) as updated_on,
  FROM
    `thoth-qa.thoth.examGrades`
  where valid_to is null
);


CREATE OR REPLACE VIEW thoth-qa.thoth.parameter_grades
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
  CAST( JSON_VALUE(parameter.isCurrentVersion) as BOOL ) isCurrentVersion
  FROM
    `thoth-qa.thoth.examGrades`, UNNEST(JSON_EXTRACT_ARRAY(value.parameterGrades , '$')) parameter
  where valid_to is null
);