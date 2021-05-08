import firebase from 'firebase/app';
import "firebase/auth";

export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyAIggZ3hyq4iHi5SiBhGXQ7tnzs0kmmNH4",
    //authDomain: "celtic-bivouac-307316.firebaseapp.com",
    authDomain: "examenes.raxacademy.com",
    databaseURL: "https://celtic-bivouac-307316-default-rtdb.firebaseio.com",
    projectId: "celtic-bivouac-307316",
    storageBucket: "celtic-bivouac-307316.appspot.com",
    messagingSenderId: "671173409486",
    appId: "1:671173409486:web:7a9521ddf9ec974f33ae9f",
    measurementId: "G-ZHNWBMKVQ2"
    //apiURL:"https://celtic-bivouac-307316.uc.r.appspot.com/api"
  
  },
  //apiURL:"http://192.168.15.16:5000/api"
  apiURL:"https://celtic-bivouac-307316.uc.r.appspot.com/api"
};

firebase.initializeApp(environment.firebase)