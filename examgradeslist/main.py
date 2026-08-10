import functions_framework
from examgradelist import userListByClaim, gradesListByEvaluatorId, updateParameterGrade, getStudentDisplayName

@functions_framework.http
def hello(request):
    return "Hello, World!"

@functions_framework.http
def examgradeslist(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/stable/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/stable/api/#flask.make_response>.
    """
    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'evaluator_id' in request_json:
        evaluator_id = request_json['evaluator_id']
    elif request_args and 'evaluator_id' in request_args:
        evaluator_id = request_args['evaluator_id']
    else:
        return ('Missing evaluator_id', 400)
    return gradesListByEvaluatorId(evaluator_id)


@functions_framework.http
def updateparametergrade(request):
    """HTTP Cloud Function.
    Expects JSON body: { "examGrade_id": "...", "parameterGrade": { ... } }
    Updates ParameterGrade, CriteriaGrades and AspectGrades with the fields
    written by the examgrade-parameter-apply web functionality.
    """
    request_json = request.get_json(silent=True)

    if not request_json:
        return ('Missing request body', 400)

    examGrade_id = request_json.get('examGrade_id')
    parameter_grade = request_json.get('parameterGrade')

    if not examGrade_id:
        return ('Missing examGrade_id', 400)
    if not parameter_grade:
        return ('Missing parameterGrade', 400)

    return updateParameterGrade(examGrade_id, parameter_grade)


@functions_framework.http
def studentdisplayname(request):
    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'student_uid' in request_json:
        student_uid = request_json['student_uid']
    elif request_args and 'student_uid' in request_args:
        student_uid = request_args['student_uid']
    else:
        return ('Missing student_uid', 400)
    return getStudentDisplayName(student_uid)


@functions_framework.http
def userlist(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/stable/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/stable/api/#flask.make_response>.
    """
    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'claim' in request_json:
        claim = request_json['claim']
    elif request_args and 'claim' in request_args:
        claim = request_args['claim']
    else:
        return ('Missing claim', 400)
    return userListByClaim(claim)