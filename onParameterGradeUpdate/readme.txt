#deploy to qa  formerly knows as examGradeScoreUpdate 
gcloud config set project thoth-qa
gcloud functions deploy parameterGradeUpdate --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/thoth-qa/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" --project thoth-qa
gcloud functions deploy parameterGradeDelete --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.delete"  --trigger-resource "projects/thoth-qa/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}"

#deploy to dev
gcloud config set project thoth-dev-346022
gcloud functions deploy parameterGradeUpdate --no-gen2 --region=us-central1 --entry-point examGradeScoreUpdate --runtime python312 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" --project thoth-dev-346022
gcloud functions deploy parameterGradeUpdate --gen2 --region=us-central1 --entry-point examGradeScoreUpdate --runtime python314 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" --project thoth-dev-346022
gcloud functions deploy parameterGradeDelete --region=us-central1 --entry-point examGradeScoreUpdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.delete"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}"

gcloud beta run deploy parameterGradeUpdate --gen2 --runtime python313 --entry-point examGradeScoreUpdate
gcloud beta run deploy parameterGradeDelete --gen2 --runtime python313 --region=us-central1 --entry-point examGradeScoreUpdate  --source . --trigger-event "providers/cloud.firestore/eventTypes/document.delete"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" --project thoth-dev-346022


gcloud run deploy parametergradeupdate  --function parameterGradeUpdate --region us-central1 --base-image python314
gcloud eventarc triggers create parametergradeupdatetrigger   `
    --location=nam5  `
    --destination-run-service=parametergradeupdate   `
    --destination-run-region=us-central1  `
    --event-filters=type=google.cloud.firestore.document.v1.updated  `
    --event-filters=database='(default)'  `
    --event-data-content-type=application/protobuf  `
    --event-filters-path-pattern=document='examGrades/{examGradeId}/parameterGrades/{parameterGradeId}'  `
    --service-account=301917458282-compute@developer.gserviceaccount.com 

//show the project app will apply to
gcloud config list



