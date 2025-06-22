// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import firebase from 'firebase/app';
import "firebase/auth";
import 'firebase/firestore';
import 'firebase/storage';

export const environment = { 
  production: false,
  firebase:{
    apiKey: "AIzaSyDB_dPrLkmeIm3-n_4TNxpt94BrUqn0_Rk",

    authDomain: "raxacademy.com",
  
    databaseURL: "https://thoth-qa-default-rtdb.firebaseio.com",
  
    projectId: "thoth-qa",
  
    storageBucket: "thoth-qa.appspot.com",
  
    messagingSenderId: "357669808993",
  
    appId: "1:357669808993:web:87f3ec430f556b05683320"
  
  },
  chenequeURL:"https://us-central1-thoth-qa.cloudfunctions.net/chenequeRequest",
  examServicesURL: "https://examservices-534zkr6qdq-uc.a.run.app",
  authURL:"https://us-central1-thoth-qa.cloudfunctions.net/authRequest",
  certificatesDeleteURL:"https://us-central1-thoth-qa.cloudfunctions.net/deleteCertificateMateriaEnrollmentPost",
  certificatesCreateURL:"https://us-central1-thoth-qa.cloudfunctions.net/createCertificateMateriaEnrollmentPost",
  gsApiUrl: "https://us-central1-thoth-qa.cloudfunctions.net/gsRequest" ,
  certificatesBucket:"certificates-thoth-qa",

  
  //apiURL:"https://celtic-bivouac-307316.uc.r.appspot.com/api"

  recaptcha: {
    siteKey: '6LcFB7ohAAAAAMBJx7mf6-49OMW2JYbLuVgLl3d2',
  },  
  computeURL:'https://us-central1-thoth-qa.cloudfunctions.net/computeRequest',
  zone:'us-central1-a',
  OPENVIDU_INSTANCE_NAME:'openvidu'  
};

const app = firebase.initializeApp(environment.firebase)

const auth = firebase.auth();
export const storage = firebase.storage(app)

  
export const db = firebase.firestore(app);

if (location.hostname === "localhost") {
  console.log("localhost detected!");
  //auth.useEmulator("http://localhost:9099");
  //db.useEmulator("localhost", 8080);

}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
