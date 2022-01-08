python -m venv venv

python -m pip install --upgrade pip

pip install --upgrade google-api-python-client

python -m pip install -r requirements.txt

#to setup
gcloud functions deploy OnStorageObjectMetadataUpdate --region=us-central1 --entry-point OnStorageObjectMetadataUpdate --runtime python39 --source . --trigger-event "google.storage.object.metadataUpdate"  --trigger-resource "cheneque-dev-videos" 
gcloud functions deploy OnStorageObjectDelete --region=us-central1 --entry-point OnStorageObjectDelete --runtime python39 --source . --trigger-event "google.storage.object.delete"  --trigger-resource "cheneque-dev-videos" 
gcloud functions deploy OnStorageObjectFinalize --region=us-central1 --entry-point OnStorageObjectFinalize --runtime python39 --source . --trigger-event "google.storage.object.finalize"  --trigger-resource "cheneque-dev-videos" 

/projects/{cheneque-dev-4ee34}/buckets/{cheneque-dev-videos}

#to be able to run the function locally
pip install functions-framework

#run the function and wait for request
functions_framework --target=OnStorageObjectMetadataUpdate

#this run the function but does not allow for debugging
curl.exe --% -X POST -H "Content-Type: application/json" -d "@./request.json" http://localhost:8080