gcloud projects list
gcloud config set project thoth-qa




#deploy function to cloud functions
gcloud functions deploy createPaymentIntendPost --runtime python39 --trigger-http --allow-unauthenticated --security-level=secure-optional
gcloud functions deploy getProductDefaultPricePost --runtime python39 --trigger-http --allow-unauthenticated --security-level=secure-optional
gcloud functions deploy getPaymentIntentPost --runtime python39 --trigger-http --allow-unauthenticated --security-level=secure-optional

***** cerficate generation process ********
1.- load the master in certificates-thoth-qa/certificates_master and then run the habilidades_master_test
for it to put the color cicles.

2.- run the examGrade_create_certificate to create the actual certificates or use the web app
******************************************-

curl -m 70 -X POST -H "Content-Type:application/json" -d "{\"certificateId\":\"raul_test\",\"studentName\":\"Claudia Gamboa\",\"materiaName\":\"Salsa\",\"label1\":\"Salsa\",\"label2\":\"X\",\"label3\":\"Otros\",\"label4\":\"www.rax.com\",\"color1\":\"blue\",\"color2\":\"red\"}" https://us-central1-thoth-qa.cloudfunctions.net/createCertificate 

{
    "certificateId":"raul_test" ,
    "studentName":"Claudia Gamboa",
    "materiaName":"Salsa",
    "label1":"Salsa",
    "label2":"X",
    "label3":"Otros",
    "label4":"www.rax.com",
    "color1":"blue",
    "color2":"red"
}

#to list the projects
gcloud projects list

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

