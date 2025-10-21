#deploy to qa  formerly knows as examGradeScoreUpdate 
gcloud config set project thoth-qa
gcloud functions deploy parameterGradeUpdate --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/thoth-qa/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" --project thoth-qa
gcloud functions deploy parameterGradeDelete --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.delete"  --trigger-resource "projects/thoth-qa/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}"

#deploy to dev
gcloud config set project thoth-dev-346022
gcloud functions deploy parameterGradeUpdate --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" --project thoth-dev-346022
gcloud functions deploy parameterGradeDelete --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.delete"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}"

gcloud run deploy parameterGradeUpdate --gen2 --runtime python313 --trigger-http --allow-unauthenticated --timeout 1800s
gcloud run deploy parameterGradeDelete --gen2 --runtime python313 --region=us-central1 --entry-point examGradeScoreUpdate  --source . --trigger-event "providers/cloud.firestore/eventTypes/document.delete"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" --project thoth-dev-346022

//show the project app will apply to
gcloud config list



