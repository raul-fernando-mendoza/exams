// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import firebase from 'firebase/app';
import "firebase/auth";

export const environment = { 
  production: false,
  firebase:{
    apiKey: "AIzaSyDB_dPrLkmeIm3-n_4TNxpt94BrUqn0_Rk",

    authDomain: "thoth-qa.firebaseapp.com",
  
    databaseURL: "https://thoth-qa-default-rtdb.firebaseio.com",
  
    projectId: "thoth-qa",
  
    storageBucket: "thoth-qa.appspot.com",
  
    messagingSenderId: "357669808993",
  
    appId: "1:357669808993:web:87f3ec430f556b05683320"
  
  },
  apiURL:"https://thoth-qa.uc.r.appspot.com/api",
  certificatesURL:"https://us-central1-thoth-qa.cloudfunctions.net/createCertificate",
  gsApiUrl:"https://us-central1-thoth-qa.cloudfunctions.net/processRequest",
  certificatesBucket:"certificates-thoth-qa"

 
  //apiURL:"https://celtic-bivouac-307316.uc.r.appspot.com/api"
};

const app = firebase.initializeApp(environment.firebase)

const auth = firebase.auth();

  
//const db = firebase.firestore();

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
