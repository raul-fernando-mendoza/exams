import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observer } from 'rxjs';
import { FormControl } from '@angular/forms';
import { db, storage } from 'src/environments/environment';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class LoadObserversModule { }

export class FileLoadObserver implements Observer<any>  {
  constructor( 
    private fc:FormControl,
    private storageRef,
    private career_id:string, 
    private propertyName:string,
    private element:HTMLElement){

  } 
  next=(snapshot =>{
    console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
    this.element.innerText = snapshot.bytesTransferred + " of " + snapshot.totalBytes
  })
  error=(cause =>{
    console.log("error:" + cause)
  })
  complete=( () =>{
    this.element.innerText = ""
    console.log("complete" + this.career_id + " " + this.propertyName)
    console.log("Completed"); // progress of upload
    this.storageRef.getDownloadURL().then( url =>{
      console.log(url)        
      if( this.career_id ){
        var obj = {}
        obj[this.propertyName]=url
        db.collection("careers").doc(this.career_id).update(obj).then( () =>{
          console.log(`update as completed ${this.career_id} / ${url}`)
          this.fc.setValue(url)
        })
      }
      else{
        this.fc.setValue(url)
      }
    },
    reason =>{
      console.log("ERROR on url" + reason)
    })      
  });
}

export class VideoLoadObserver implements Observer<any>  {
  constructor( 
    private fc:FormControl,
    private storageRef,
    private career_id:string, 
    private propertyName:string,
    private element:HTMLElement,
    private router){

  } 
  next=(snapshot =>{
    console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
    this.element.innerText = snapshot.bytesTransferred + " of " + snapshot.totalBytes
  })
  error=(cause =>{
    console.log("error:" + cause)
  })
  complete=( () =>{
    this.element.innerText = ""
    console.log("complete" + this.career_id + " " + this.propertyName)
    console.log("Completed"); // progress of upload
    this.storageRef.getDownloadURL().then( url =>{
      console.log(url)        
      if( this.career_id ){
        var obj = {}
        obj[this.propertyName]=url
        db.collection("careers").doc(this.career_id).update(obj).then( () =>{
          console.log(`update as completed ${this.career_id} / ${url}`)
          //let currentUrl = this.router.url;
          //window.location.reload()
          this.fc.setValue(url)
        })
      }
      else{
        this.fc.setValue(url)
      }
    },
    reason =>{
      console.log("ERROR on url" + reason)
    })      
  });
}