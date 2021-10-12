#to install pil
python -m pip install pillow --global-option="build_ext" --global-option="--enable-zlib" --global-option="--enable-jpeg" --global-option="--enable-tiff" --global-option="--enable-freetype" --global-option="--enable-webp" --global-option="--enable-webpmux" --global-option="--enable-jpeg2000"

python -m pip install --upgrade pip
pip install -r requirements.txt

#if the source files does not load then
#remove the directive "#!include from .gcloudignore

#To deploy use:
gcloud functions deploy examgradesparameterupdate --region=us-central1 --entry-point examgradesparameterupdate --runtime python39 --source . --trigger-event "providers/cloud.firestore/eventTypes/document.update"  --trigger-resource "projects/celtic-bivouac-307316/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" 

