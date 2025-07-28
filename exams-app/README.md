# ExamsApp
#to execute use
npm start

#helpful commands
firebase help
firebase login
firebase projects:list  

# use the followng to select the hosting option.
firebase projects:list
firebase use <project_id>
firebase init


#use to deploy the app 
#first change the enterprise.js key to the production key in index.html
#then compile for deployment with --configuration = production
ng build --configuration="production"
firebase deploy

#to change user
firebase login:list
firebase login:add rfmh24hr@gmail.com
firebase login:use rfmh24hr@gmail.com


#use to run the emulator activate the emulator mode in environment.ts
firebase init
firebase emulators:start
firebase use <project_id>
also check the default project in .firebaserc


#to use http requests on storage use the cloud shell to create a file called cors.json with this content:
[
    {
      "origin": ["*"],
      "method": ["GET"],
      "maxAgeSeconds": 3600
    }
]
#then run this command 
gsutil cors set cors.json gs://thoth-dev-346022.appspot.com
gsutil cors set cors.json gs://thoth-qa.appspot.com

#to export the indexes the file should be stored as firestore.indexes.json
firebase firestore:indexes > firestore.indexes_export.json
firebase deploy --only firestore:indexes

#to verify the typescript version installed 
cd node_modules\.bin\
./tsc -v

#to get all depencies
npm list --depth=0 > list_dependencies.txt

site key development
6LcV24krAAAAANUPjBJ4tGKQ16C06auSvpQp_Rkq

secretkey development
6LcV24krAAAAAIfYMIhxasBoniJ18UNWJO_m6Qxz

PROD recaptcha site key
6Ld8-I4rAAAAABuRxywFcpvvt8-ckbonfl0KgjD4

PROD recaptcha secretkey
6Ld8-I4rAAAAALRjI96B5V3RDObU-Wf39db0BAEK
