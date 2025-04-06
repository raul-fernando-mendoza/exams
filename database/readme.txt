firebase emulators:start

firebase init emulators

firebase login --reauth

firebase deploy

# use the followng to select the hosting option.
firebase projects:list
firebase use <project_id>
firebase init
firebase init storage
firebase init hosting


#use to deploy the app first compile for deployment
ng build --configuration="production"
firebase deploy

run: gcloud auth application-default login 
grpc._channel._MultiThreadedRendezvous: <_MultiThreadedRendezvous of RPC that terminated with:
        status = StatusCode.UNAVAILABLE
        details = "Getting metadata from plugin failed with error: ('invalid_grant: Bad Request', {
'error_description': 'Bad Request'})"
        debug_error_string = "UNKNOWN:Error received from peer  {grpc_message:"Getting metadata fro: (\'invalid_grant: Bad Request\', {\'error\': \'invalid_grant\', \'error_description\': \'Bad Requ
created_time:"2024-11-29T17:34:13.1501717+00:00"}"
>