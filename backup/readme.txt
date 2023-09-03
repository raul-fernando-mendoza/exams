#deploy function to cloud functions RUN from carrerAdvanceUpdate folder
gcloud functions deploy backupfull  --runtime python39 --trigger-http --allow-unauthenticated --gen2 --timeout 1800s

gcloud beta functions deploy backup  --gen2 --runtime python39 --trigger-http --allow-unauthenticated --timeout 1800s

//show the project app will apply to
gcloud config list
gcloud config set project thoth-dev-346022
gcloud auth list
gcloud projects list

