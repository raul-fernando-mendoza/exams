#deploy function to cloud functions RUN from carrerAdvanceUpdate folder
gcloud functions deploy examServices --runtime python39 --trigger-http --allow-unauthenticated --security-level=secure-optional

//show the project app will apply to
gcloud config list
gcloud config set project thoth-dev-346022
gcloud auth list
gcloud projects list
