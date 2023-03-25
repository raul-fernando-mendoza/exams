import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { db , storage} from 'src/environments/environment';
import { FileLoadObserver } from "../load-observers/load-observers.module"
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TimerDialog } from '../timer-dialog/timer-dlg';
import videojs from 'video.js';
import * as uuid from 'uuid';
import { MatDialog } from '@angular/material/dialog';
import { TitleStrategy } from '@angular/router';
import { VideoMarker, Marker, MarkerPath, MarkerPoint } from '../exams/exams.module';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';

interface MarkerItem{
  marker:Marker
  audioData:AudioBuffer
  markerPaths:MarkerPath[]

}




const BLACKBOARD = 'blackboard'
const NEXT = 'next'
const PREV = 'prev'


@Component({
  selector: 'app-video-marks',
  templateUrl: './video-marks.component.html',
  styleUrls: ['./video-marks.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VideoMarksComponent implements OnInit , AfterViewInit, OnDestroy{

  currentTime:number = 0.00

  @ViewChild(BLACKBOARD) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('target') target: ElementRef;

  @Input() parentCollection:string = "drawing/123"
  @Input() id:string="123"

  videoMarker:VideoMarker=null

  public ctx: CanvasRenderingContext2D;
  elem:HTMLCanvasElement
  ppts:MarkerPoint[]=[] 
  paths:MarkerPoint[][] = [] 

  isTouch:boolean

  MOUSE_DOWN:boolean
  PAINT_START = 'mousedown';
  PAINT_MOVE = 'mousemove';
  PAINT_END = 'mouseup';

  point = {
    x: 0,
    y: 0
  };

  mouseDown:boolean = false

  isPlaying = false

 


  //the purpose is to know if a marker should be started.
  lastMarkerIdx:number = null // indicate the last marker played
  lastScrolledTime:number = 0 // indicate the last time to which the user scrolled
  
  markerItems:MarkerItem[] = []

  unsubscribes = []


  organization_id = null


  mediaRecorder
  isRecording:boolean = false
  audioBlob = null 
  isAdmin = false 
 

/* sound variables */

  AudioContext = window.AudioContext ;
  context = new AudioContext(); // Make it crossbrowser
  yodelBuffer = void 0;
  gainNode = null

  sounds = []

  player = null
  videoDuration:number = 0.0

  isMarkerActive:boolean = false
  isMarkerEdited:boolean = false
  startMarker:number = null
  loopDuration:number = 0
  percentage:number = 0

  isUnmuted = false
  isPlayingLoop = false
  isPlayingAllMarkers = false

  sourceAudioBuffer = null
  
  constructor(
    private userPreferencesService: UserPreferencesService
    ,private userLoginService: UserLoginService
    , private http: HttpClient
    , public dialog: MatDialog
    , private examenesImprovisacionService:ExamenesImprovisacionService
  ) {
    this.organization_id = this.userPreferencesService.getCurrentOrganizationId()
    if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
      this.isAdmin = true
    }    
  }

  ngOnInit(): void {
    this.isTouch = !!('ontouchstart' in window);
    this.PAINT_START = this.isTouch ? 'touchstart' : 'mousedown';
    this.PAINT_MOVE = this.isTouch ? 'touchmove' : 'mousemove';
    this.PAINT_END = this.isTouch ? 'touchend' : 'mouseup';    
    console.log( this.isTouch )

    if( !this.isIOS() ){
      this.isUnmuted = true
    }
    this.examenesImprovisacionService.getObject(this.parentCollection + "/VideoMarker",this.id).then( (obj)=>{
      this.videoMarker = obj as VideoMarker
      this.player.src({ type: 'video/mp4', src: this.videoMarker.videoUrl });
    })

    
  }
  ngOnDestroy(): void {
    this.unsubscribes.forEach( unsubscribe =>{
      unsubscribe()
    })
  }

  
  
  onCurrentTime(currentTime:number){
    if( this.isMarkerActive == false && this.isPlayingAllMarkers == true && this.isPlayingLoop == false){ // we can only start a new marker if no other marker is been played and we are in a playing state
      //find the next marker that has a time larger than the previous played and larger than the lastScrolledTime
      for( let i = this.lastMarkerIdx != null ? this.lastMarkerIdx + 1 : 0; i< this.markerItems.length ; i++){
        let markerItem = this.markerItems[i]
        if( markerItem.marker.startTime <= currentTime && 
          markerItem.marker.startTime >= this.lastScrolledTime &&
          currentTime >= this.lastScrolledTime 
            ){   
            this.playMarker( i , false).then(()=>{
              this.clear()
              this.playVideo()
            })
          break;
        }
      }
    }  
  }

  getAudioBuffer(url):Promise<AudioBuffer>{
    var thiz=this
    return new Promise<AudioBuffer>((resolve, reject)=>{
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = e => {
        console.log(xhr.response);
        var audioBlob:Blob = xhr.response
        audioBlob.arrayBuffer()
        .then(arrayBuffer => thiz.context.decodeAudioData(arrayBuffer,
          audioBuffer => {
            resolve(audioBuffer);
            },
            error =>{
              console.error(error)
              reject(error)
            }
        ))
      }
      xhr.onerror = e =>{
        console.log( "error:" + e)
      }
      xhr.open('GET', url);
      xhr.send();   
    })
  }

  ngAfterViewInit(): void {

    var storageRef = storage.ref( "organizations/" + this.organization_id + "/laboratoryGrades/unmute.wav"  )

   
    var thiz = this
    storageRef.getDownloadURL().then( url =>{
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = e => {
        console.log(xhr.response);
        var audioBlob:Blob = xhr.response
        audioBlob.arrayBuffer()
        .then(arrayBuffer => thiz.context.decodeAudioData(arrayBuffer,
          audioBuffer => {
            this.yodelBuffer = audioBuffer;
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

    },
    reason=>{
      alert("ERROR:" + reason)
    })

    this.ctx = this.canvas.nativeElement.getContext('2d');  

    this.ctx.lineJoin = this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 6;
    this.ctx.strokeStyle = "red";    

    
    
    this.elem = this.canvas.nativeElement
    this.resizeCanvasToDisplaySize(this.elem)
    this.draw()

    //sound
    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = 1; // set volume to 100%


    var options = {
      fluid: false,
      autoplay: false,
      controls: false,
      width:640,
      height:480,
      /*
      sources: [{
          src: this.videoMarker.videoUrl,
          type: "video/mp4",
      }],
      */
      controlBar: {
        resizeManager: false
      }      
    };

    var thiz = this

    this.player = videojs(this.target.nativeElement, options, function onPlayerReady() {
      console.log('onPlayerReady', this);
      this.on("timeupdate",function onTimeUpdate() {
        console.log("time has changed" + this.currentTime())
        thiz.showCurrentTime()
        thiz.onCurrentTime( this.currentTime() )
        if( thiz.isMarkerActive || thiz.isPlayingLoop){
          if( thiz.player.currentTime() > (thiz.startMarker + thiz.loopDuration) ){
            thiz.player.currentTime( thiz.startMarker )
          }
        }
      })
      this.on("playing",function onTimeUpdate() {
        console.log("isPlaying true")
        thiz.isPlaying = true
      })  
      this.on("pause",function onTimeUpdate() {
        console.log("isPlaying false")
        thiz.isPlaying = false
      })
      this.on("fullscreenchange", function onFullScreen(){
        if(thiz.player.isFullscreen()){
          thiz.player.exitFullscreen();
        }
      })
    });

    
    this.loadMarkers()
     
  }  


  unmute(){    
    this.playSound(this.yodelBuffer)
    this.isUnmuted = true;
  } 

  resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
   
    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
   
    return needResize;
  }

  private draw() {
    this.ctx.font = '30px Arial';
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';

    const x = (this.canvas.nativeElement as HTMLCanvasElement).width / 2;
    const y = (this.canvas.nativeElement as HTMLCanvasElement).height / 2;
    this.ctx.fillText('@raxacademy', x, y);

  }  
  getOffset(elem) {
    var bbox = elem.getBoundingClientRect();
    return {
      left: bbox.left,
      top: bbox.top
    };
  }; 
  setPointFromEvent(point, e) {
    
    if (this.isTouch) {
      point.x = e.changedTouches[0].pageX - this.getOffset(e.target).left - Math.floor(window.scrollX);
      point.y = e.changedTouches[0].pageY - this.getOffset(e.target).top - Math.floor(window.scrollY);
    } else {
      point.x = e.offsetX !== undefined ? e.offsetX : e.layerX;
      point.y = e.offsetY !== undefined ? e.offsetY : e.layerY;
    }
  };  

  clear(){
    this.ctx.beginPath();
    this.ctx.clearRect(0, 0, this.elem.width, this.elem.height);     
  }
  
  paint(e) {


    if (e) {
      e.preventDefault();
      this.setPointFromEvent(this.point, e);
    }

    // Saving all the points in an array
    this.ppts.push({
      x: this.point.x,
      y: this.point.y
    });

    // For the last 2 points
    if ( this.ppts.length > 2){
      let i = this.ppts.length - 2
      this.ctx.beginPath();
      this.ctx.lineJoin = this.ctx.lineCap = 'round';
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = "red";        
      this.ctx.moveTo(this.ppts[i].x, this.ppts[i].y)

      this.ctx.quadraticCurveTo(
        this.ppts[i].x,
        this.ppts[i].y,
        this.ppts[i + 1].x,
        this.ppts[i + 1].y
      );
      this.ctx.stroke()
      this.ctx.closePath()
      
    }
  }; 

  paintPath( ppts ){
    
    this.ctx.beginPath();
    this.ctx.lineJoin = this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "red";        
    this.ctx.moveTo(ppts[0].x, ppts[0].y)
    for( let i=0; i<ppts.length-1; i++){

      this.ctx.quadraticCurveTo(
        ppts[i].x,
        ppts[i].y,
        ppts[i + 1].x,
        ppts[i + 1].y
      );
    }  
    this.ctx.stroke()
    this.ctx.closePath()
      

  }

  
  @HostListener('mouseup')
  onMouseup() {
      this.MOUSE_DOWN = false;
      console.log("mouse up:")
      if(this.ppts.length) {
        this.paths.push(this.ppts.slice())
        this.ppts.length = 0
        console.log( "count paths:" + this.paths.length)
      }
  } 
  @HostListener('touchend')
  touchend() {
      this.MOUSE_DOWN = false;
      console.log("touch up:")
      if(this.ppts.length) {
        this.paths.push(this.ppts.slice())
        this.ppts.length = 0
        console.log( "count paths:" + this.paths.length)
      }
  } 

  @HostListener('mousemove', ['$event'])
  onMousemove(e: MouseEvent) {
    //console.log("mousemove:'" + e.target["id"] + "' " + this.MOUSE_DOWN + " " + e.offsetX + "," + e.offsetY + " " + e.x + "," + e.y)
    if(BLACKBOARD == e.target["id"] && this.MOUSE_DOWN ) {
      e.preventDefault();
      this.paint(e);
    }
  }
  @HostListener('touchmove', ['$event'])
  touchmove(e: MouseEvent) {
    //console.log("mousemove:'" + e.target["id"] + "' " + this.MOUSE_DOWN + " " + e.offsetX + "," + e.offsetY + " " + e.x + "," + e.y)
    if(BLACKBOARD == e.target["id"] && this.MOUSE_DOWN ) {
      e.preventDefault();
      this.paint(e);
    }
  }
  @HostListener('mousedown', ['$event'])
  onMousedown(e) {
    console.log("mouse down:" + e.target["id"] + " " +  e)
    if ( BLACKBOARD == e.target["id"] ){
      this.MOUSE_DOWN = true;
      this.ppts.length = 0
    }  
    if ( PREV == e.target["id"] ){
      this.onPreviousMarker()
    }    
    if ( NEXT == e.target["id"] ){
      this.onNextMarker()
    }       
  } 
  
  @HostListener('touchstart', ['$event'])
  touchstart(e) {
    console.log("touch down:" + e.target["id"] + " " +  e)
    if ( BLACKBOARD == e.target["id"] ){
      this.MOUSE_DOWN = true;
      this.ppts.length = 0
    } 
    if ( PREV == e.target["id"] ){
      this.onPreviousMarker()
    }    
    if ( NEXT == e.target["id"] ){
      this.onNextMarker()
    }       
  }   
  
  onUndo(){
    this.paths.pop()
    this.clear()
    this.paths.map( path =>{
      this.paintPath( path )
    })    
  }



  resumePlay() {
    this.clear()
    this.paths.length = 0
    this.ppts.length = 0
    this.player.volume(1.0)
    this.player.play();    
  }  

  loadMarkers(){
      var unsubscribe = db.collection(this.parentCollection + "/Marker").onSnapshot( markerSet =>{
        this.markerItems.length = 0
        

        var transactions = []

        markerSet.docs.map( breakPointDoc =>{
          const marker = breakPointDoc.data() as Marker
          var markerItem:MarkerItem={
            marker: marker,
            audioData: null,
            markerPaths: []
          }
          this.markerItems.push(markerItem)

          let transactionAudio = this.getAudioBuffer( marker.commentUrl ).then( audioData =>{
            markerItem.audioData = audioData
          })
          transactions.push( transactionAudio )


          let transactionPaths= this.loadPaths( this.parentCollection, markerItem ).then( ()=>{
            console.log("setup onSnapshot")
          })
          transactions.push( transactionPaths )
          
        })
        Promise.all( transactions ).then( ()=>{
          this.markerItems.sort( 
            (a,b) => { 
              return  a.marker.startTime - b.marker.startTime 
            })
        })
      },
      (reason)=>{
        alert("Error:" + reason)
      })
      this.unsubscribes.push( unsubscribe )
  }

  loadPaths( path:string, markerItem:MarkerItem):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      
      var unsubscribe = db.collection(this.parentCollection + "/Marker/" + markerItem.marker.id + "/MarkerPath").onSnapshot( set =>{
        markerItem.markerPaths.length = 0
        set.docs.map( doc=>{
          var markerPath = doc.data() as MarkerPath 
          markerItem.markerPaths.push( markerPath )
        })
        resolve()
      },
      reason =>{
        alert("ERROR loadPaths:" + reason)
        reject( reason )
      })
      this.unsubscribes.push( unsubscribe )
    })
  }

  stopVideo():Promise<void>{
    var thiz=this
    return new Promise<void>((resolve, reject)=>{
      this.player.pause()
      var interval = setInterval( () => { 
        if(thiz.isPlaying == false)
          {
            clearInterval(interval)
            resolve()
          }
       }, 100)    
  
    })
  }
  startVideo():Promise<void>{
    var thiz=this
    return new Promise<void>((resolve, reject)=>{
      this.player.play()
      var interval = setInterval( () => { 
        if(thiz.isPlaying == true)
          {
            clearInterval(interval)
            resolve()
          }
       }, 100)    
  
    })
  }  

  playMarker(index, stop=false):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      console.log("starting marker:" + index)
      // now plays the sound
      this.isMarkerActive = true
      this.lastMarkerIdx = index
      
      this.startMarker = this.markerItems[index].marker.startTime  
      this.loopDuration = this.markerItems[index].marker.loopDuration
      if( this.loopDuration > 0){
        this.isPlayingLoop= true
      }

      this.clear()
      this.player.currentTime(this.startMarker);
      this.player.volume(0.3)
      
      if( this.loopDuration > 0){
        this.player.play()
      }
      else{
        this.player.pause()
      }
      
  
      var markerPaths=this.markerItems[index].markerPaths 
      this.clear()
      markerPaths.forEach(
        markerPath=>{
          this.paintPath( markerPath.points )
        }
      )

      var audioBuffer = this.markerItems[index].audioData
      console.log("marker start sound:" + index)
      this.playSound( audioBuffer ).then( ()=>{
        this.isPlayingLoop=false
        
        if( stop ){
          this.stopVideo().then( ()=>{
            this.isMarkerActive=false
            resolve()
          })
        }
        else{
          this.isMarkerActive=false
          resolve()
        }
      })
    })        
  }


  /********* recording  */


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

  onSave(){
    this.save()
    this.isMarkerEdited = false
  }
  
  //save an audio and return the path
  saveSound(id, audioBlob):Promise<string>{
    return new Promise<string>((resolve,reject)=>{
      const bucketName = "organizations/" + this.organization_id + "/" + this.parentCollection + "/breakpoint_" + id + ".wav"
    
      var storageRef = storage.ref( bucketName )

      var uploadTask = storageRef.put(audioBlob, { contentType: 'audio/wav'})
      uploadTask.on("state_change", {
        'next':(snapshot =>{
          console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
        }),
        'error':(cause =>{
          console.log("error:" + cause)
          reject(cause)
        }),
        'complete':( () =>{
          resolve(bucketName)
        })
      })
    })
  }

  save():Promise<void>{
    return new Promise<null>((resolve, reject)=>{
      let _resolve = resolve
      let _reject=reject

      let markerPaths:MarkerPath[] = []
      this.paths.map( path =>{
        var markerPath:MarkerPath={
          id:uuid.v4(),
          points:path
        }
        markerPaths.push( markerPath )
      })

      var id = uuid.v4()
      var marker:Marker = {
        id:id, 
        startTime:this.startMarker,
        loopDuration:this.loopDuration,
      }




      if( this.audioBlob ){          
        var transactionSaveSound = this.saveSound(id, this.audioBlob).then( fullpath =>{
          marker.commentPath = fullpath
          let storageRef  = storage.ref( marker.commentPath )
          storageRef.getDownloadURL().then( url =>{
            marker.commentUrl = url

            var markerItem:MarkerItem = {
              marker:marker,
              audioData:this.audioBlob,
              markerPaths:markerPaths
            }
            this.markerItems.push(
              markerItem
            )       
            return this.saveMarkerItem( markerItem ).then( ()=>{
                console.log("marker saved")
                _resolve(null)     
              },              
              error=>{
                alert("error writing Marker:" + error)
                _reject(error)
            })     
          })          
        })
      } 
      else{
        var markerItem:MarkerItem = {
          marker:marker,
          audioData:null,
          markerPaths:markerPaths
        }
        this.markerItems.push(
          markerItem
        )       
        return this.saveMarkerItem( markerItem ).then( ()=>{
            console.log("marker saved")
            _resolve(null)     
          },              
          error=>{
            alert("error writing Marker:" + error)
            _reject(error)
        })     
   
      } 
    })
  }

  saveMarkerItem( markerItem:MarkerItem ):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      let marker:Marker = markerItem.marker
      let transactions = []
      db.collection(this.parentCollection + "/Marker").doc(marker.id).set(marker).then( () =>{
          this.paths
          console.log("marker saved")
          this.saveMarkerPaths( marker.id, markerItem.markerPaths).then(()=>{
            console.log("completed saving paths")
            resolve()
          })
      },
      reason=>{
        alert("error writing Marker:" + reason)
        reject(reason)
      })
    })
  }
  saveMarkerPaths( markerId:string, paths:MarkerPath[] ):Promise<void>{
    return new Promise<null>((resolve, reject)=>{
      let transactions = paths.map( path =>{
        return db.collection( this.parentCollection + "/Marker/" + markerId + "/MarkerPath").doc( path.id ).set( path ).then( ()=>{
          console.log("saved path:"+ path.id)
        },
        reason=>{
          alert("Error Saving MarkerPath"+ reason)
          reject( reason )
        })
      })
      Promise.all( transactions ).then( ()=>{
        console.log("finish save markerPath");
        resolve(null)
      },
      reason=>{
        console.log("error no finised")
        reject(reason)
      })
    })
  }


  onDelete( id ){
    
    var storageRef = storage.ref( this.videoMarker.videoPath )
    storageRef.delete().then( () =>{
      console.log("file deleted")
    })
    .catch( reason =>{
      console.log("there has been an error:" + reason)
    })

    db.collection(this.parentCollection + "/Marker" ).doc( id ).delete().then( data =>{
      console.log("deleted")
    })
    .catch( reason =>{
      console.log("there has been an error:" + reason)
    })        
    
    
  }


  playSound(audioBuffer):Promise<void> {
    return new Promise<null>((resolve,reject) => {
      console.log("marker play sound:")
      var thiz = this
      if( this.sourceAudioBuffer != null){
        this.sourceAudioBuffer.stop()
      }
  
      this.sourceAudioBuffer = this.context.createBufferSource();
      this.sourceAudioBuffer.buffer = audioBuffer;
      this.sourceAudioBuffer.connect(this.context.destination);
      this.sourceAudioBuffer.addEventListener("ended", (e) =>{
        resolve(null)
      })
      this.sourceAudioBuffer.start();
  
    })
  }
/*    
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
    

  };
*/

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
  isIOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  } 

  onPlayVideo(){
    if( this.isPlaying == true ){
      if( this.sourceAudioBuffer != null){
        this.sourceAudioBuffer.stop()
      }
      this.isPlayingAllMarkers = false
      this.isPlayingLoop = false
      this.stopVideo()
    }
    else{
      this.clear()
      this.isPlayingLoop = false
      this.isPlayingAllMarkers = true
      this.playVideo()
    }
  }


  playVideo(){
    this.player.play()
  } 
  onStartEditMarker(){
      this.player.pause()
      this.resetMarker()      
      this.isMarkerEdited = true
  }  

  onSlide(value:number) {
    console.log("This is emitted as the thumb slides");
    var duration = this.player.duration()
    var newTime:number = parseFloat( (duration * (  value / 100)).toFixed(2) )
    this.player.currentTime(newTime)
    this.resetMarker()
    this.lastScrolledTime=parseFloat( newTime.toFixed(2) )
    this.lastMarkerIdx = null
  }  

  showCurrentTime(){
    this.currentTime = parseFloat( this.player.currentTime().toFixed(2) )
    this.videoDuration = parseFloat( this.player.duration().toFixed(2) )
    this.percentage = Math.floor( (this.currentTime / this.videoDuration) * 100)  
 
  }
  backward(){
    var currentTime = parseFloat( this.player.currentTime().toFixed(2) )
    if(currentTime > 1){
      currentTime = currentTime -1
      this.player.currentTime(currentTime)

    } 
    else{
      currentTime = 0
      this.player.currentTime( currentTime )
    } 

    this.lastScrolledTime= parseFloat( currentTime.toFixed(2) )
    if( this.isMarkerEdited == true){
      this.startMarker = this.startMarker - 1
    }
    else{  
      this.lastMarkerIdx = null
    }
      
  }
  forward(){
    var currentTime = parseFloat( this.player.currentTime().toFixed(2) )
    if( (currentTime + 1) < this.player.duration() ){
      currentTime = currentTime + 1 
      this.player.currentTime( currentTime )
    }
    else{
      var duration = parseFloat( this.player.duration().toFixed(2) )
      this.player.currentTime( duration )
    }
    this.lastScrolledTime= parseFloat( currentTime.toFixed(2) )
    if( this.isMarkerEdited == true){
      this.startMarker = this.startMarker + 1
    }
    else{  
      this.lastMarkerIdx = null
    }
  }

  displayTime( value:number ){
    if( value != null){
      return value.toFixed(2)
    }
    else return ""
  }

  playLoop(){
    if( this.isPlayingLoop ) {
      this.stopVideo().then( () =>{
        this.isPlayingLoop = false
      })
    }
    else{
      this.player.currentTime( this.startMarker )      
      this.startVideo().then( ()=>{
        this.isPlayingLoop = true
      })
    }
  }

  onLoopLength($event){
    console.log("loop lenght changed" + $event.value)

    var value = $event.value

    if( (this.startMarker + value) <= this.player.duration() ){
      this.loopDuration =  value 
    }
    else{
      this.loopDuration = Math.floor( this.player.duration() - this.startMarker )
    }  
    this.player.currentTime( this.startMarker + this.loopDuration)      
  }  

  onCancel(){
    this.resetMarker()
    this.isMarkerEdited = false
  }
  resetMarker(){
    //clear all paths
    this.clear()
    this.paths.length = 0
    this.ppts.length = 0  
    
    //reset all marker variables
    this.loopDuration = 0
    this.startMarker = parseFloat( this.player.currentTime().toFixed(2) )
    this.lastMarkerIdx = null

    //reset volume of player
    this.player.volume(1.0)
  }

  onMute(){
    var isMuted = this.player.muted()
    this.player.muted( !isMuted )
  }

  onSpeedChange($event){
    this.player.playbackRate($event.value)
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

  onPreviousMarker(){
    if( this.markerItems.length > 0){
      if( this.lastMarkerIdx == null ){
        this.playMarker(0, true)
      }
      else if( this.lastMarkerIdx != null && this.lastMarkerIdx -1 >= 0){
        this.playMarker(this.lastMarkerIdx - 1, true)
      }

    }     

  }
  onNextMarker(){
    if( this.markerItems.length > 0){
      if( this.lastMarkerIdx == null ){
        this.playMarker(0, true)
      }
      else if( this.lastMarkerIdx != null && this.lastMarkerIdx + 1 < this.markerItems.length){
        this.playMarker(this.lastMarkerIdx + 1, true)
      }
    } 
  }
}

