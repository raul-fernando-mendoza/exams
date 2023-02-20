import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TimerDialog } from '../timer-dialog/timer-dlg';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { db, storage, environment } from 'src/environments/environment';
import { FileLoadObserver } from '../load-observers/load-observers.module';

@Component({
  selector: 'app-soundfile-edit',
  templateUrl: './soundfile-edit.component.html',
  styleUrls: ['./soundfile-edit.component.css']
})
export class SoundfileEditComponent implements OnInit {
 
  @Input() collection:string  // the collection 
  @Input() id:string          // id of the document
  @Input() property:string    // property where to save the property + "Url" and property + "Path"

  organizationId = null

  mediaRecorder = null
  isRecording = false
  audioBlob = null
  isPlaying = false

  AudioContext = window.AudioContext ;
  context = new AudioContext(); // Make it crossbrowser
  sourceAudioBuffer = null


  constructor( 
     public dialog: MatDialog 
    ,private userPreferencesService: UserPreferencesService
    ,private userLoginService: UserLoginService    
    ) { 
      this.organizationId = this.userPreferencesService.getCurrentOrganizationId()
    }

  ngOnInit(): void {
  }

  onStartRecording(){
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {

    
  
      this.mediaRecorder = new MediaRecorder(stream );
      this.mediaRecorder.start();
      this.isRecording = true;
      
      const audioChunks = [];

      this.mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener("stop", () => {
        this.audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(this.audioBlob);
        const audio = new Audio(audioUrl);
        audio.play() 
      }); 
      
      this.onTimerStart()
    });    
  }
  onStopRecording(){
    this.mediaRecorder.stop();
    this.isRecording = false;

  }
  onTimerStart(){
    const dialogRef = this.dialog.open(TimerDialog, {
      height: '400px',
      width: '250px',
      data: { label:"Tiempo Restante", timeLeft:30}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.onStopRecording()
      }
      else{
        this.onStopRecording()
      }
    });

  }

  saveSound(id){
    if( this.audioBlob != null ){
     

      const bucketName = "organizations/" + this.organizationId + "/" + this.collection + "/" + this.id

    
      var storageRef = storage.ref( bucketName )

      var uploadTask = storageRef.put(this.audioBlob, { contentType: 'audio/wav'})
      var element = document.getElementById("commentStatus")
      var fileLoadObserver = new FileLoadObserver(storageRef, this.collection, this.id, this.property, element );
      uploadTask.on("state_change", fileLoadObserver)
    }       
  }
  playSound(audioBuffer, stop) {
    console.log("marker play sound:")
    var thiz = this
    if( this.sourceAudioBuffer != null){
      this.sourceAudioBuffer.stop()
    }

    this.sourceAudioBuffer = this.context.createBufferSource();
    this.sourceAudioBuffer.buffer = audioBuffer;
    this.sourceAudioBuffer.connect(this.context.destination);
    this.sourceAudioBuffer.addEventListener("ended", (e) =>{
      console.log("sound ended")
      this.isPlaying = false
    })    
    this.sourceAudioBuffer.start();

  };

  loadSound( url ):Promise<any>{
    return new Promise<any>( (resolve, reject) =>{


      var thiz = this
      var xhr = new XMLHttpRequest();
          
          
      xhr.responseType = 'blob';
      xhr.onload = e => {
        console.log(xhr.response);
        var audioBlob:Blob = xhr.response
        audioBlob.arrayBuffer()
        .then(
          arrayBuffer => 
            thiz.context.decodeAudioData(arrayBuffer,
          audioBuffer => {
            resolve(audioBuffer)
          },
          error =>{
            console.error(error)
            reject(error)

          })
        )
      }
      xhr.onerror = e =>{
        console.log( "error:" + e)
      }
      xhr.open('GET', url);
      xhr.send();   
    })  
  }


}
