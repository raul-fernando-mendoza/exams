#deploy function to cloud functions
gcloud functions deploy createCertificate --runtime python39 --trigger-http --allow-unauthenticated


#to list the projects
gcloud project list

#to list the credentials
gcloud auth list

#login 
gcloud auth login

#switch project 
gcloud config set project PROJECT_ID

#to set the active account
gcloud config set account `ACCOUNT`


#to install pil
python -m pip install pillow --global-option="build_ext" --global-option="--enable-zlib" --global-option="--enable-jpeg" --global-option="--enable-tiff" --global-option="--enable-freetype" --global-option="--enable-webp" --global-option="--enable-webpmux" --global-option="--enable-jpeg2000"

python -m pip install --upgrade pip
pip install -r requirements.txt

#if the source files does not load then
#remove the directive "#!include from .gcloudignore

#To deploy use:
#OLD gcloud functions deploy examgradesparameterupdate --region=us-central1 --entry-point examgradesparameterupdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/celtic-bivouac-307316/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" 
gcloud functions deploy examgradesupdate --region=us-central1 --entry-point examgradesupdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/celtic-bivouac-307316/databases/(default)/documents/examGrades/{examGradeId}" 

