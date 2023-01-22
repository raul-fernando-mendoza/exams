import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { db , storage  } from 'src/environments/environment';

class FileLoadObserver implements Observer<any>  {
  constructor( 
    private fullpath:string,
    private statusElement:HTMLElement,
    private inputFileElement:HTMLElement,
    private onload:EventEmitter<string>){
  } 
  next=(snapshot =>{
    console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
    this.statusElement.innerText = snapshot.bytesTransferred + " of " + snapshot.totalBytes
  })
  error=(cause =>{
    this.statusElement.innerText = "Error:" + cause
  })
  complete=( () =>{
    this.statusElement.innerText = "Complete"
    this.inputFileElement.innerText = this.fullpath.split("/").reverse()[0]
    this.onload.emit(this.fullpath)
    /*
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
            this.onload.emit(this.storageRef.fullPath)
          },
          reason=>{
            alert("ERROR update to collection:" + reason)
          })
        }
        else{
          db.collection(this.collection_name).doc(this.id).set(obj).then( () =>{
            console.log(`update as completed ${this.id} / ${url}`)
            this.onload.emit(this.storageRef.fullPath)
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
    */      
  });
}

@Component({
  selector: 'app-file-loader',
  templateUrl: './file-loader.component.html',
  styleUrls: ['./file-loader.component.css']
})
export class FileLoaderComponent implements OnInit {
  @Input() basepath:string
  @Input() fullpath:string
  @Input() maxSize = 200 * 1024*1024 
  @Output() onload = new EventEmitter<string>();
  @Output() ondelete = new EventEmitter<string>();

  @ViewChild('status', {static: true}) statusElement: ElementRef;
  @ViewChild('fileName', {static: true}) inputFileElement: ElementRef;

  constructor() { 
    
  }

  ngOnInit(): void {
  }

  selectFile(event) {

    
    var selectedFiles = event.target.files;
   
    var file:File = selectedFiles[0]

    

    if( file.size > 4000 * 1024*1024) {
      alert( "El archivo es muy grande")
      return
    }

    //path = "organizations/" + this.organizationId + "/" + this.collectionPath + "/" + this.docId + "/" + filename
    this.fullpath =  this.basepath + "/" + file.name

    var storageRef = storage.ref( this.fullpath )

    var uploadTask = storageRef.put(file)
    var fileLoadObserver = new FileLoadObserver(this.fullpath, this.statusElement.nativeElement,this.inputFileElement.nativeElement, this.onload);
    uploadTask.on("state_change", fileLoadObserver)
  }   

  removePropertyValue(){

    var storageRef = storage.ref( this.fullpath )
    
    storageRef.delete().then( () =>{
      this.ondelete.emit(storageRef.fullPath)
    })
    .catch( reason => {
      console.log("file was not deleted")      
    })
    /*
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
            this.ondelete.emit(storageRef.fullPath)
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
    */
  }

  getFileName(){
    if( this.fullpath != null){
      return this.fullpath.split("/").reverse()[0] 
    }
    else return "File" 
  }
    
}
