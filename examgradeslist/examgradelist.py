
import json
from datetime import datetime
import firebase_admin
from firebase_admin import firestore
from firebase_admin import auth

if not firebase_admin._apps:
    firebase_admin.initialize_app()


def _serialize(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if hasattr(value, 'isoformat'):
        return value.isoformat()
    if hasattr(value, '_seconds'):  # Firestore Timestamp
        return datetime.utcfromtimestamp(value._seconds).isoformat()
    return value


def _doc_to_dict(doc):
    data = {}
    for k, v in (doc.to_dict() or {}).items():
        data[k] = _serialize(v)
    data['id'] = doc.id
    return data


def gradesListByEvaluatorId(evaluator_id: str):
    db = firestore.client()

    exam_grades_query = (
        db.collection('examGrades')
          .where('evaluators', 'array_contains', evaluator_id)
          .where("isCompleted", "==", False)
          .where("isDeleted", "==", False)
    )

    parameter_grades_list = []
    materia_cache = {}

    for exam_grade_doc in exam_grades_query.stream():
        param_grades_query = (
            exam_grade_doc.reference.collection('parameterGrades')
                        .where('evaluator_uid', '==', evaluator_id)
                        .where("isCompleted", "==", False)
                        .where("isCurrentVersion", "==", True)
        )

        exam_grade_data = exam_grade_doc.to_dict() or {}
        for param_doc in param_grades_query.stream():
            param_data = _doc_to_dict(param_doc)
            param_data['examGrade_id'] = exam_grade_doc.id
            param_data['studentUids'] = exam_grade_data.get('studentUids', [])
            param_data['examGradeTitle'] = exam_grade_data.get('title')
            param_data['expression'] = exam_grade_data.get('expression')
            param_data['level'] = exam_grade_data.get('level')

            materia_id = exam_grade_data.get('materia_id')
            if materia_id:
                if materia_id not in materia_cache:
                    materia_doc = db.collection('materias').document(materia_id).get()
                    materia_data = materia_doc.to_dict() or {}
                    materia_cache[materia_id] = materia_data.get('materia_name')
                param_data['materiaName'] = materia_cache.get(materia_id)

            criteria_list = []
            for criteria_doc in param_doc.reference.collection('criteriaGrades').stream():
                criteria_data = _doc_to_dict(criteria_doc)

                aspect_list = []
                for aspect_doc in criteria_doc.reference.collection('aspectGrades').stream():
                    aspect_list.append(_doc_to_dict(aspect_doc))

                criteria_data['aspectGrades'] = aspect_list
                criteria_list.append(criteria_data)

            param_data['criteriaGrades'] = criteria_list
            parameter_grades_list.append(param_data)

    parameter_grades_list.sort(key=lambda x: x['examGradeTitle'].lower() if x['examGradeTitle'] else '')

    return json.dumps({'parameterGrades': parameter_grades_list}, indent=1)

def updateParameterGrade(examGrade_id: str, parameter_grade: dict):
    """
    Updates a single ParameterGrade and its nested CriteriaGrades and AspectGrades
    with only the fields written by the examgrade-parameter-apply web functionality:

    ParameterGrade : score, earnedPoints, availablePoints, isCompleted,
                     evaluator_comment, evaluator_uid
    CriteriaGrade  : score, earnedPoints, availablePoints
    AspectGrade    : isGraded, score, missingElements
    """
    db = firestore.client()

    param_id = parameter_grade.get('id')
    if not param_id:
        return json.dumps({'error': 'parameterGrade.id is required'}), 400

    param_ref = (
        db.collection('examGrades')
          .document(examGrade_id)
          .collection('parameterGrades')
          .document(param_id)
    )

    param_update = {k: parameter_grade[k] for k in (
        'score', 'earnedPoints', 'availablePoints', 'isCompleted', 'evaluator_comment', 'evaluator_uid'
    ) if k in parameter_grade}

    if param_update:
        param_ref.update(param_update)

    for criteria_grade in parameter_grade.get('criteriaGrades', []):
        criteria_id = criteria_grade.get('id')
        if not criteria_id:
            continue

        criteria_ref = param_ref.collection('criteriaGrades').document(criteria_id)

        criteria_update = {k: criteria_grade[k] for k in (
            'score', 'earnedPoints', 'availablePoints'
        ) if k in criteria_grade}

        if criteria_update:
            criteria_ref.update(criteria_update)

        for aspect_grade in criteria_grade.get('aspectGrades', []):
            aspect_id = aspect_grade.get('id')
            if not aspect_id:
                continue

            aspect_ref = criteria_ref.collection('aspectGrades').document(aspect_id)

            aspect_update = {k: aspect_grade[k] for k in (
                'isGraded', 'score', 'missingElements'
            ) if k in aspect_grade}

            if aspect_update:
                aspect_ref.update(aspect_update)

    return json.dumps({'success': True, 'id': param_id})


def getStudentDisplayName(student_uid: str):
    try:
        user = auth.get_user(student_uid)
        custom_claims = user.custom_claims or {}
        display_name = custom_claims.get('displayName') or user.display_name or user.email
        return json.dumps({'uid': student_uid, 'displayName': display_name})
    except auth.UserNotFoundError:
        return json.dumps({'error': f'User {student_uid} not found'}), 404


def userListByClaim(claim:str):
   
    userlist = []

    for user in auth.list_users().iterate_all():
        if claim:
            if user.custom_claims and claim in user.custom_claims:
                userlist.append( { 
                    "uid":user.uid,
                    "email":user.email,
                    "displayName":user.custom_claims.get('displayName') or user.display_name or user.email,
                    "claims":user.custom_claims
                    }
                )
    userlist.sort(key=lambda x: x['displayName'].lower() if x['displayName'] else '')
    return json.dumps({'userlist': userlist}, indent=1)