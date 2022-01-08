#gcloud functions deploy onExamGradesParameterDelete --region=us-central1 --entry-point onExamGradesParameterDelete --runtime python39 --trigger-event "providers/cloud.firestore/eventTypes/document.delete"  --trigger-resource "projects/celtic-bivouac-307316/databases/(default)/documents/examGrades/{examGradeId}/parameterGrades/{parameterGradeId}" 
from google.cloud import firestore
from google.cloud import storage
import logging

logger = logging.getLogger("cheneque")
logger.setLevel(logging.DEBUG)

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.ERROR)


log = logging.getLogger("cheneque")

def OnStorageObjectMetadataUpdate(event, context):
    """Triggered by a change to a Firestore document.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """

    # now print out the entire event object
    print("event:" + str(event))
    print("context:" + str(context))
    resource_string = context.resource
    # print out the resource string that triggered the function
    print(f"Function triggered by change to: {resource_string}.")    

 
    firebase_client = firestore.Client()
    storage_client = storage.Client()
    
    onMetadataUpdate(firebase_client, storage_client, event["bucket"], event["name"], event["metadata"] )
    return {"result":"ok"}

def onMetadataUpdate(firebase_client, storage_client, bucket_name, blob_name , metadata): 
 
    full_name = bucket_name + str("/") + blob_name

    doc_ref_list = firebase_client.collection(u'ObjectMetadataUpdate').where("fullName", "==", full_name).get()
    if len(doc_ref_list) > 0:
        doc_ref = doc_ref_list[0].reference
    else:
        doc_ref = firebase_client.collection(u'ObjectMetadataUpdate').document()
    bucket = storage_client.bucket(bucket_name)
    log.debug("bucket.exists:" + str(bucket.exists()) )
    if bucket.exists() != True:
        raise "the bucket doest not exist"
    
    blob = bucket.blob(blob_name)
    log.debug("blob.exists:{blob.exists()}" )
    if blob.exists() != True:
        raise "File does not exist"
    
    acl = []
    for entry in blob.acl:
        acl_entity = {
            "entity":entry["entity"].split("-")[0],
            "name":entry["entity"].split("-")[1],
            "access":entry["role"]
        }
        acl.append(acl_entity)

    values = {
        "fullName":full_name,  
        "bucket":bucket_name,
        "name":blob_name, 
        "metadata":metadata, 
        "puclic_url":blob.public_url,
        "acl":acl
    }

    doc_ref.set(values) 
    return values 
      
def OnStorageObjectDelete(event, context):
    """Triggered by a change to a Firestore document.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """

    # now print out the entire event object
    print("event:" + str(event))
    print("context:" + str(context))
    resource_string = context.resource
    # print out the resource string that triggered the function
    print(f"Function triggered by change to: {resource_string}.")    

 
    firebase_client = firestore.Client()
    storage_client = storage.Client()

    StorageObjectRemoved(firebase_client, event["bucket"], event["name"] )

    return {"result":"ok"}

def StorageObjectRemoved(firebase_client, bucket_name, blob_name ): 
 
    full_name = bucket_name + str("/") + blob_name

    doc_ref_list = firebase_client.collection(u'ObjectMetadataUpdate').where("fullName", "==", full_name).get()
    if len(doc_ref_list) > 0:
        doc_ref = doc_ref_list[0].reference
        doc_ref.delete()    

    return {"result":"ok"}

def OnStorageObjectFinalize(event, context):
    """Triggered by a change to a Firestore document.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """

    # now print out the entire event object
    print("event:" + str(event))
    print("context:" + str(context))
    resource_string = context.resource
    # print out the resource string that triggered the function
    print(f"Function triggered by change to: {resource_string}.")    

    firebase_client = firestore.Client()
    storage_client = storage.Client()

    metadata = {}
    if "metadata" in event:
        metadata = event["metadata"] 
        
    
    onMetadataUpdate(firebase_client, storage_client, event["bucket"], event["name"], metadata)
    return {"result":"ok"}



