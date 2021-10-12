// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import firebase from 'firebase/app';
import "firebase/auth";

export const environment = { 
  production: false,
  firebase:{
      apiKey: "AIzaSyCpjqfjNiZJoTksBgLtL2JQnWV5ONjFa1k",
      authDomain: "cheneque-dev-4ee34.firebaseapp.com",
      projectId: "cheneque-dev-4ee34",
      storageBucket: "cheneque-dev-4ee34.appspot.com",
      messagingSenderId: "80335332365",
      appId: "1:80335332365:web:bdefd12feed59e6dc4e144"
  },
  apiURL:"https://cheneque-dev-4ee34.uc.r.appspot.com/api"
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
