--INSERT INTO exam_exercise SELECT NULL, type_id, label, ind FROM old_exam_exercise

--insert into exam_col 
SELECT NULL, right(exercise_id,1), label, ind FROM old_exam_col ORDER BY exercise_id, ind

--insert into exam_row SELECT NULL, right(exercise_id,1), label, ind, row_value FROM old_exam_row

SELECT * FROM old_exam_col ORDER BY exercise_id, ind

--INSERT INTO exam_col_element
WITH elements AS (
SELECT old_exam_col_element.exercise_id, old_exam_col.ind col_ind, old_exam_col_element.col_id,old_exam_col.label column_label, old_exam_col_element.label, old_exam_col_element.ind
FROM old_exam_col_element
, old_exam_col
where
      old_exam_col_element.exercise_id = old_exam_col.exercise_id
  AND old_exam_col_element.col_id = old_exam_col.col_id
ORDER BY old_exam_col_element.exercise_id, old_exam_col.ind, old_exam_col_element.ind
)
SELECT NULL, tc.exercise_id,
tc.col_id, elements.label , elements.ind
FROM elements
, translation_col tc
WHERE  
      elements.exercise_id = tc.old_exercise_id
  AND elements.col_id = tc.old_col_id
  ORDER BY exercise_id, col_id, col_ind, ind

--INSERT INTO exam_row_col_element 
WITH elements AS (
SELECT 
old_exam_row_col_element.exercise_id, old_exam_row_col_element.row_id, old_exam_row_col_element.col_id,old_exam_row_col_element.label, old_exam_row_col_element.ind 
, old_exam_row.label row_label, old_exam_row.ind row_ind , old_exam_col.label col_label,old_exam_col.ind col_ind
FROM old_exam_row_col_element
, old_exam_col
, old_exam_row
where
      old_exam_row_col_element.exercise_id = old_exam_col.exercise_id
  AND old_exam_row_col_element.col_id = old_exam_col.col_id
  AND old_exam_row_col_element.exercise_id = old_exam_row.exercise_id
  AND old_exam_row_col_element.row_id = old_exam_row.row_id  
  AND old_exam_col.exercise_id = old_exam_row.exercise_id
ORDER BY old_exam_row_col_element.exercise_id, old_exam_col.ind, old_exam_row.ind, old_exam_row_col_element.ind
)
SELECT NULL AS row_col_element_id, exam_col.exercise_id,  exam_row.row_id, exam_col.col_id, elements.label , elements.ind 
FROM elements
, exam_col
, exam_row
WHERE  
      right(elements.exercise_id,1) = exam_col.exercise_id
  AND elements.col_label = exam_col.label
  AND right(elements.exercise_id,1) = exam_row.exercise_id
  AND elements.row_label = exam_row.label
ORDER BY exercise_id, row_id, col_id, ind  


#row col status
--INSERT INTO exam_row_col_status
WITH elements AS (
SELECT 
old_exam_row_col_disable.exercise_id, old_exam_row_col_disable.row_id, old_exam_row_col_disable.col_id,old_exam_row_col_disable.disable
, old_exam_row.label row_label, old_exam_row.ind row_ind , old_exam_col.label col_label,old_exam_col.ind col_ind
FROM old_exam_row_col_disable
, old_exam_col
, old_exam_row
where
      old_exam_row_col_disable.exercise_id = old_exam_col.exercise_id
  AND old_exam_row_col_disable.col_id = old_exam_col.col_id
  AND old_exam_row_col_disable.exercise_id = old_exam_row.exercise_id
  AND old_exam_row_col_disable.row_id = old_exam_row.row_id  
  AND old_exam_col.exercise_id = old_exam_row.exercise_id
ORDER BY old_exam_row_col_disable.exercise_id, old_exam_col.ind, old_exam_row.ind
)
SELECT  exam_col.exercise_id,  exam_row.row_id, exam_col.col_id, disable
FROM elements
, exam_col
, exam_row
WHERE  
      right(elements.exercise_id,1) = exam_col.exercise_id
  AND elements.col_label = exam_col.label
  AND right(elements.exercise_id,1) = exam_row.exercise_id
  AND elements.row_label = exam_row.label
  AND exam_col.exercise_id >2
ORDER BY exercise_id, row_id, col_id

INSERT INTO exam_application
SELECT *,0  FROM examen


--CREATE TABLE translation_col
SELECT  old_exam_col.exercise_id old_exercise_id, exam_col.exercise_id, old_exam_col.ind , old_exam_col.col_id old_col_id,  old_exam_col.label, exam_col.col_id
FROM 
	old_exam_col,
	exam_col
where
      right(old_exam_col.exercise_id,1) = exam_col.exercise_id
  AND old_exam_col.label = exam_col.label
ORDER BY old_exam_col.exercise_id, old_exam_col.ind 

--CREATE TABLE translation_row
SELECT  old_exam_row.exercise_id old_exercise_id, exam_row.exercise_id, old_exam_row.ind , old_exam_row.row_id old_row_id,  old_exam_row.label, exam_row.row_id
FROM 
	old_exam_row,
	exam_row
where
      right(old_exam_row.exercise_id,1) = exam_row.exercise_id
  AND old_exam_row.label = exam_row.label
ORDER BY old_exam_row.exercise_id, old_exam_row.ind 



/* observaciones */


SELECT old_row_id FROM  translation_old_new

select  old_row_id FROM  translation_old_new

--INSERT INTO exam_row_col_selected
SELECT o.examen_id, r.exercise_id, r.row_id, c.col_id, is_selected    
from examen_observaciones o
,translation_col c
,translation_row r
WHERE
    o.exercise_id = c.old_exercise_id
AND o.col_id = c.old_col_id
AND o.exercise_id = r.old_exercise_id
AND o.row_id = r.old_row_id 

--, e.row_col_element_id, ece.col_element_id,  r.label,  c.label, o.reason_id
--INSERT INTO exam_row_col_element_selected  
SELECT o.examen_id, r.exercise_id, r.row_id, c.col_id, coalesce(e.row_col_element_id, ece.col_element_id)
from razones_seleccionadas o
join translation_col c ON (
    o.exercise_id = c.old_exercise_id
AND o.col_id = c.old_col_id
)
join translation_row r ON (
	o.exercise_id = r.old_exercise_id
	AND o.row_id = r.old_row_id 
)
LEFT JOIN exam_row_col_element e ON (
    e.col_id = c.col_id
AND e.row_id = r.row_id
AND e.exercise_id = r.exercise_id
AND e.ind = o.reason_id
)
LEFT JOIN exam_col_element ece ON (
	    ece.col_id = c.col_id
	and ece.ind = o.reason_id
	AND ece.exercise_id = c.exercise_id
)
ORDER BY o.examen_id, r.exercise_id, r.label, c.label

--INSERT INTO exam_row_col_text
SELECT o.examen_id, r.exercise_id, r.row_id, c.col_id, otra_razon    
from otras_razones_seleccionadas o
,translation_col c
,translation_row r
WHERE
    o.exercise_id = c.old_exercise_id
AND o.col_id = c.old_col_id
AND o.exercise_id = r.old_exercise_id
AND o.row_id = r.old_row_id 


INSERT exam_row_total
SELECT o.examen_id, r.exercise_id, r.row_id,  row_total    
from examen_totales o
,translation_row r
WHERE
    o.exercise_id = r.old_exercise_id
AND o.row_id = r.old_row_id 

INSERT INTO exam_row_selected
SELECT examen_id, r.exercise_id, r.row_id  
FROM movimientos_cancelados o
,translation_row r
where  o.exercise_id = r.old_exercise_id
AND o.row_id = r.old_row_id 