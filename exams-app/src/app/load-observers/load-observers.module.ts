import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observer } from 'rxjs';
import { FormControl } from '@angular/forms';
import { db, storage } from 'src/environments/environment';




export class FileLoadObserver implements Observer<any>  {
  constructor( 
    private storageRef,
    private collection_name,
    private id:string, 
    private propertyName:string,
    private statusElement:HTMLElement){

  } 
  next=(snapshot =>{
    console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
    this.statusElement.innerText = snapshot.bytesTransferred + " of " + snapshot.totalBytes
  })
  error=(cause =>{
    console.log("error:" + cause)
  })
  complete=( () =>{
    this.statusElement.innerText = ""
    console.log("complete" + this.id + " " + this.propertyName)
    console.log("Completed"); // progress of upload
    this.storageRef.getDownloadURL().then( url =>{
      console.log(url)        
      var obj = {}
      obj[this.propertyName + "Url"]=url
      obj[this.propertyName + "Path"]=this.storageRef.fullPath
      
      db.collection(this.collection_name).doc(this.id).update(obj).then( () =>{
        console.log(`update as completed ${this.id} / ${url}`)
        //this.fc.setValue(url)
      },
      reason=>{
        alert("ERROR update to collection:" + reason)
      })
    },
    reason =>{
      console.log("ERROR on url" + reason)
    })      
  });
}

export class VideoLoadObserver implements Observer<any>  {
  constructor( 
    private storageRef,
    private collectionPath,
    private id:string, 
    private propertyName:string,
    private statusElement:HTMLElement){

  } 
  next=(snapshot =>{
    console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
    this.statusElement.innerText = snapshot.bytesTransferred + " of " + snapshot.totalBytes
  })
  error=(cause =>{
    console.log("error:" + cause)
  })
  complete=( () =>{
    this.statusElement.innerText = ""
    console.log("complete" + this.id + " " + this.propertyName)
    console.log("Completed"); // progress of upload
    this.storageRef.getDownloadURL().then( url =>{
      console.log(url)        
      var obj = {}
      obj[this.propertyName + "Url"]=url
      obj[this.propertyName + "Path"]=this.storageRef.fullPath      
      db.collection(this.collectionPath).doc(this.id).update(obj).then( () =>{
        console.log(`update as completed ${this.id} / ${url}`)
      })

    },
    reason =>{
      console.log("ERROR on url" + reason)
    })      
  });
}

