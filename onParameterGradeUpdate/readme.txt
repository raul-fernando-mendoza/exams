#deploy to qa
gcloud config set project thoth-qa
gcloud functions deploy examGradeScoreUpdate --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/thoth-qa/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}"

#deploy to dev
gcloud config set project thoth-dev-346022
gcloud functions deploy examGradeScoreUpdate --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}"

//show the project app will apply to
gcloud config list



