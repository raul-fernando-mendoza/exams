// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import firebase from 'firebase/app';
import "firebase/auth";
import 'firebase/firestore';
import 'firebase/storage';

export var environment = { 
  production: false,
  firebase:{
    apiKey: "AIzaSyDn5IjaxzfaDy0Ji2ckRYLURfM9xym97a0",

    authDomain: "thoth-dev-346022.firebaseapp.com",
  
    projectId: "thoth-dev-346022",
  
    storageBucket: "thoth-dev-346022.appspot.com",
  
    messagingSenderId: "301917458282",
  
    appId: "1:301917458282:web:1ac1b8cf650e222cf95f13"
  
  },
  chenequeURL:"https://us-central1-thoth-dev-346022.cloudfunctions.net/chenequeRequest",
  examServicesURL:"https://examservices-dlyf7noyxa-uc.a.run.app",
  authURL:"https://us-central1-thoth-dev-346022.cloudfunctions.net/authRequest",
  certificatesDeleteURL:"https://us-central1-thoth-dev-346022.cloudfunctions.net/deleteCertificateMateriaEnrollmentPost",
  certificatesCreateURL:"https://us-central1-thoth-dev-346022.cloudfunctions.net/createCertificateMateriaEnrollmentPost",
  gsApiUrl: "https://us-central1-thoth-dev-346022.cloudfunctions.net/gsRequest" ,
  certificatesBucket:"certificates-thoth-dev-346022",

  
  //apiURL:"https://celtic-bivouac-307316.uc.r.appspot.com/api"

  recaptcha: {
    siteKey: '6LcV24krAAAAANUPjBJ4tGKQ16C06auSvpQp_Rkq',
    secretKey:'6LcV24krAAAAAIfYMIhxasBoniJ18UNWJO_m6Qxz',
    //url:'http://localhost:3000/your-page.html'
    url:'https://us-central1-thoth-dev-346022.cloudfunctions.net/captchaserver'
  },  
  computeURL:'https://us-central1-thoth-dev-346022.cloudfunctions.net/computeRequest',
  zone:'us-central1-a',
  OPENVIDU_INSTANCE_NAME:'openvidu-test'
  
};

if (location.hostname === "localhost") {
  environment.firebase["databaseURL"] = "http://localhost:8080/?ns=sample-project"
}

const app = firebase.initializeApp(environment.firebase)

const auth = firebase.auth();
export const storage = firebase.storage()
export const db = firebase.firestore();

/*
if (location.hostname === "localhost") {
  console.log("localhost detected!");
  auth.useEmulator("http://localhost:9099");
  db.useEmulator("localhost",8080);
  storage.useEmulator("localhost",9199);
}
*/

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
