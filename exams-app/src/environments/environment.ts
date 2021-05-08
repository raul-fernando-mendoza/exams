// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import firebase from 'firebase/app';
import "firebase/auth";

export const environment = { 
  production: false,
  firebase: {
    apiKey: "AIzaSyAIggZ3hyq4iHi5SiBhGXQ7tnzs0kmmNH4",
    authDomain: "celtic-bivouac-307316.firebaseapp.com",
    //authDomain: "examenes.raxacademy.com",
    databaseURL: "https://celtic-bivouac-307316-default-rtdb.firebaseio.com",
    projectId: "celtic-bivouac-307316",
    storageBucket: "celtic-bivouac-307316.appspot.com",
    messagingSenderId: "671173409486",
    appId: "1:671173409486:web:7a9521ddf9ec974f33ae9f",
    measurementId: "G-ZHNWBMKVQ2"
   // apiURL:"https://celtic-bivouac-307316.uc.r.appspot.com/api"
  },
  apiURL:"http://192.168.15.12:10000/api"
  //apiURL:"https://celtic-bivouac-307316.uc.r.appspot.com/api"
};

firebase.initializeApp(environment.firebase)

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
