import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observer } from 'rxjs';
import { db, storage  } from 'src/environments/environment';

export interface FileLoadedEvent{
  property:string
  fileFullPath:string
}

class FileLoadObserver implements Observer<any>  {
  constructor( 
    private property:string,
    private fullpath:string,
    private statusElement:HTMLElement,
    private inputFileElement:HTMLElement,
    private onload:EventEmitter<FileLoadedEvent>){
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
    var event:FileLoadedEvent={
      property:this.property,
      fileFullPath:this.fullpath
    }
    this.onload.emit(event)
  });
}




@Component({
  selector: 'app-file-loader',
  templateUrl: './file-loader.component.html',
  styleUrls: ['./file-loader.component.css']
})
export class FileLoaderComponent implements AfterViewInit{
  @Input() basepath:string //the folder where the file should be written
  @Input() label:string //displayName
  @Input() property:string //this is just an id sent by the requestor and is returned as part of the event not used internally
  @Input() filename:string //optional if present this will be the name used instead of label
  
  @Input() maxSize = 200 * 1024*1024 
  @Output() onload = new EventEmitter<FileLoadedEvent>();
  @Output() ondelete = new EventEmitter<FileLoadedEvent>();

  fullpath:string = null

  @ViewChild('status', {static: true}) statusElement: ElementRef;
  @ViewChild('fileName', {static: true}) inputFileElement: ElementRef;
 
  constructor() { 

  }
  ngAfterViewInit(): void {
    if( this.filename ){
      this.label = this.filename.split("/").reverse()[0] 
    } 
  }

  selectFile(event) {

    
    var selectedFiles = event.target.files;
   
    var file:File = selectedFiles[0]

    if( file.size > 4000 * 1024*1024) {
      alert( "El archivo es muy grande")
      return
    }

    this.fullpath = this.basepath + "/"+ file.name.replace(" ","_")

    this.label = this.fullpath.split("/").reverse()[0] 

    var storageRef = storage.ref( this.fullpath )

    var uploadTask = storageRef.put(file)
    var fileLoadObserver = new FileLoadObserver(this.property, this.fullpath, this.statusElement.nativeElement,this.inputFileElement.nativeElement, this.onload);
    uploadTask.on("state_change", fileLoadObserver)
  }   

  removePropertyValue(){

    var storageRef = storage.ref( this.fullpath )
    
    storageRef.delete().then( () =>{
      var event:FileLoadedEvent={
        property:this.property,
        fileFullPath:storageRef.fullPath
      }      
      this.ondelete.emit(event)
      this.fullpath = null
      this.inputFileElement.nativeElement.innerText = this.label
    })
    .catch( reason => {
      console.log("file was not deleted")      
    })
  }

  getFileName(){
    if( this.fullpath ){
      return this.fullpath.split("/").reverse()[0] 
    }
    else return this.label
  }
    
}
