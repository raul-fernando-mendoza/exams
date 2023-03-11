#deploy function to cloud functions RUN from carrerAdvanceUpdate folder
gcloud functions deploy examServices  --runtime python39 --trigger-http --allow-unauthenticated --security-level=secure-optional --gen2 --timeout 1800s

gcloud beta functions deploy examservices  --gen2 --runtime python39 --trigger-http --allow-unauthenticated --timeout 1800s

//show the project app will apply to
gcloud config list
gcloud config set project thoth-dev-346022
gcloud auth list
gcloud projects list
