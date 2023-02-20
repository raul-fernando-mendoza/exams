import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TimerDialog } from '../timer-dialog/timer-dlg';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';

@Component({
  selector: 'app-soundfile-edit',
  templateUrl: './soundfile-edit.component.html',
  styleUrls: ['./soundfile-edit.component.css']
})
export class SoundfileEditComponent implements OnInit {

  @Input() collection:string
  @Input() property:string

  organizationId

  mediaRecorder
  isRecording
  audioBlob

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
      const path = this.path + "/" + this.drawing_id + "/breakPoints" 
      const property = "comment"

      const bucketName = "organizations/" + this.organization_id + "/laboratoryGrades/" + this.drawing_id + "/breakpoint_" + id + ".wav"

    
      var storageRef = storage.ref( bucketName )

      var uploadTask = storageRef.put(this.audioBlob, { contentType: 'audio/wav'})
      var element = document.getElementById("commentStatus")
      var fileLoadObserver = new FileLoadObserver(storageRef, path, id, property, element );
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
      if( stop == true){
        console.log("marker stop sound:")
        if( this.isPlaying == true){
          this.player.pause()
          this.player.currentTime(this.startMarker)
          thiz = this
          var interval = setInterval( () => { 
            if(thiz.isPlaying == false)
              {
                thiz.isMarkerActive = false; 
                clearInterval(interval)
              }
           }, 100)
        }
        else{
          this.isMarkerActive = false
        }
        this.player.volume(1.0)
     
      }
      else{
        console.log("marker end sound:")
        this.isMarkerActive = false
        this.resumePlay()
      }
    })    
    this.sourceAudioBuffer.start();

  };

  loadSound( id, url ){
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
           thiz.sounds[id] = audioBuffer
         },
         error =>
           console.error(error)
      ))
          
    }
    xhr.onerror = e =>{
      console.log( "error:" + e)
    }
    xhr.open('GET', url);
    xhr.send();   

  }


}
