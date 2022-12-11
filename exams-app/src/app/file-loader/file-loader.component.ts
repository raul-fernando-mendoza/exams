import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observer } from 'rxjs';
import { db , storage  } from 'src/environments/environment';

class FileLoadObserver implements Observer<any>  {
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
    alert("error:" + cause)
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
      
      const ref = db.collection(this.collection_name).doc(this.id)
      ref.get().then( snapshot => {
        if( snapshot.exists ){
          db.collection(this.collection_name).doc(this.id).update(obj).then( () =>{
            console.log(`update as completed ${this.id} / ${url}`)
            //this.fc.setValue(url)
          },
          reason=>{
            alert("ERROR update to collection:" + reason)
          })
        }
        else{
          db.collection(this.collection_name).doc(this.id).set(obj).then( () =>{
            console.log(`update as completed ${this.id} / ${url}`)
            //this.fc.setValue(url)
          },
          reason=>{
            alert("ERROR update to collection:" + reason)
          })

        }
      })
    },
    reason =>{
      console.log("ERROR on url" + reason)
    })      
  });
}


@Component({
  selector: 'app-file-loader',
  templateUrl: './file-loader.component.html',
  styleUrls: ['./file-loader.component.css']
})
export class FileLoaderComponent implements OnInit {
  @Input() organizationId = "myorganization"
  @Input() collectionPath = "myfiles"
  @Input() docId = "abc"
  @Input() property ="fileName"
  @Input() maxSize = 200 * 1024*1024 

  constructor() { }

  ngOnInit(): void {
  }

  selectFile(event) {

    
    var selectedFiles = event.target.files;
   
    var file:File = selectedFiles[0]

    

    if( file.size > 200 * 1024*1024) {
      alert( "El archivo es muy grande")
      return
    }
    const nameParts = file.name.split(".").reverse()
    var ext = ""
    if( nameParts.length > 1 )
      ext = "." + nameParts[0]
    const bucketName = "organizations/" + this.organizationId + "/" + this.collectionPath + "/" + this.docId + "/" + this.property + ext

    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(this.property + "Status")
    this.removePropertyValue(this.property)
    var fileLoadObserver = new FileLoadObserver(storageRef, this.collectionPath , this.docId, this.property, element);
    uploadTask.on("state_change", fileLoadObserver)
  }   

  removePropertyValue(property){

    const ref = db.collection(this.collectionPath).doc(this.docId)
    ref.get().then( doc => {
      if( doc.exists ){
        const data = doc.data()
        
        const bucketName = data[this.property + "Path"]
        var storageRef = storage.ref( bucketName )
        storageRef.delete().then( () =>{
          var loadedFile = {}
          loadedFile[this.property + "Url"]=null
          loadedFile[this.property + "Path"]=null
          db.collection(this.collectionPath ).doc(this.docId).update( loadedFile ).then( () =>{
            console.log("property was removed")
          },
          reason =>{
            alert("the data can not be removed:" + reason)
          })
        })
        .catch( reason => {
          console.log("error deleting file reason:" + reason)
          var loadedFile = {}
          loadedFile[this.property + "Url"]=null
          loadedFile[this.property + "Path"]=null
          db.collection(this.collectionPath ).doc(this.docId).update( loadedFile ).then( () =>{
            console.log("property was removed")
          })          
        })
      }
    })
  }  
}
