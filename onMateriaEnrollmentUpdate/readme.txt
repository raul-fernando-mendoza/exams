gcloud config list
gcloud projects list
gcloud config set project thoth-qa

to deploy
gcloud functions deploy onMateriaEnrollmentUpdate --region=us-central1 --entry-point onMateriaEnrollmentUpdate --runtime python39 --trigger-event "providers/cloud.firestore/eventTypes/document.write"  --trigger-resource "projects/thoth-dev-346022/databases/(default)/documents/materiaEnrollments/{materiaEnrollmentId}" 

gcloud functions deploy onMateriaEnrollmentUpdate --region=us-central1 --entry-point onMateriaEnrollmentUpdate --runtime python39 --trigger-event "providers/cloud.firestore/eventTypes/document.write"  --trigger-resource "projects/thoth-qa/databases/(default)/documents/materiaEnrollments/{materiaEnrollmentId}"