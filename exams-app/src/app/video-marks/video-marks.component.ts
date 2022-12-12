import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { db , storage} from 'src/environments/environment';
import { FileLoadObserver } from "../load-observers/load-observers.module"
import * as uuid from 'uuid';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { HttpClient } from '@angular/common/http';



const BLACKBOARD = 'blackboard'
@Component({
  selector: 'app-video-marks',
  templateUrl: './video-marks.component.html',
  styleUrls: ['./video-marks.component.css']
})
export class VideoMarksComponent implements OnInit , AfterViewInit, OnDestroy{

  currentTime

  @ViewChild(BLACKBOARD) canvas: ElementRef<HTMLCanvasElement>;
  @Input() source:string = "https://firebasestorage.googleapis.com/v0/b/thoth-dev-346022.appspot.com/o/organizations%2Fraxacademy%2Fsounds%2Fclaudia.mp4?alt=media&token=dfa60d5a-4501-486b-bde2-829c2d2675d5"
  @Input() path:string = "drawing"
  @Input() drawing_id = "123"
  public ctx: CanvasRenderingContext2D;
  elem:HTMLCanvasElement
  ppts = [];  

  isTouch:boolean

  MOUSE_DOWN:boolean
  PAINT_START = 'mousedown';
  PAINT_MOVE = 'mousemove';
  PAINT_END = 'mouseup';

  point = {
    x: 0,
    y: 0
  };

  undoCache = [];

  mouseDown:boolean = false

  isPlaying = false

  paths = []



  breakPoints = [] 

  unsubscribe = null

  lastbreakPoint = "0"

  breakPointData = null

  organization_id = null


  mediaRecorder
  isRecording:boolean = false
  audioBlob = null 
  isAdmin = false 
  stopAfterPlaying = false

/* sound variables */

  URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3';
  AudioContext = window.AudioContext ;
  context = new AudioContext(); // Make it crossbrowser
  yodelBuffer = void 0;
  gainNode = null

  buffers = {}

  constructor(
    private userPreferencesService: UserPreferencesService
    ,private userLoginService: UserLoginService
    , private http: HttpClient
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

    this.loadBreakPoints()
  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }   


  onCurrentTime($event){
    console.log("the time has chaged to:" + $event)
    this.currentTime = $event.toFixed(1)
    for( let i = 0; this.isPlaying == true && i< this.breakPoints.length ; i++){
      let breakPoint = this.breakPoints[i]
      if( parseFloat(this.lastbreakPoint) < parseFloat(breakPoint.id) && 
          parseFloat(breakPoint.id) <= parseFloat( this.currentTime )
          ){
        this.onMoveToTime( breakPoint.id )
        break;
      }
    }
  }

  onIsPlaying($event){
    this.isPlaying = $event
  }
  ngAfterViewInit(): void {
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

    })
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
    this.ctx.fillText('@realappie', x, y);

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
      point.x = e.changedTouches[0].pageX - this.getOffset(e.target).left;
      point.y = e.changedTouches[0].pageY - this.getOffset(e.target).top;
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
/*
    if (this.ppts.length === 3) {
      var b = this.ppts[0];
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, this.ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      this.ctx.fill();
      this.ctx.closePath();
      return;
    }
*/
    // Tmp canvas is always cleared up before drawing.
/*    
    this.ctx.beginPath();
    this.ctx.clearRect(0, 0, this.elem.width, this.elem.height);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(e.offsetX, e.offsetY)
    this.ctx.stroke()
    this.ctx.closePath()
*/
/*
    this.ctx.beginPath();
    this.ctx.moveTo(this.ppts[0].x, this.ppts[0].y);

    for (var i = 1; i < this.ppts.length - 2; i++) {
      var c = (this.ppts[i].x + this.ppts[i + 1].x) / 2;
      var d = (this.ppts[i].y + this.ppts[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(this.ppts[i].x, this.ppts[i].y, c, d);
    }
*/
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
  @HostListener('mousemove', ['$event'])
  onMousemove(e: MouseEvent) {
    //console.log("mousemove:'" + e.target["id"] + "' " + this.MOUSE_DOWN + " " + e.offsetX + "," + e.offsetY + " " + e.x + "," + e.y)
    if(BLACKBOARD == e.target["id"] && this.MOUSE_DOWN && this.isPlaying==false) {
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
  } 
  
  onUndo(){
    this.paths.pop()
    this.clear()
    this.paths.map( path =>{
      this.paintPath( path )
    })    
  }

  eventsSubject: Subject<string> = new Subject<string>();

  resumePlay() {
    this.eventsSubject.next("");
    this.clear()
    this.paths.length = 0
    this.ppts.length = 0
  }  

  save(){
    
    this.lastbreakPoint = this.currentTime

    db.collection(this.path + "/" + this.drawing_id + "/breakPoints").doc(this.lastbreakPoint).set({"id":this.lastbreakPoint}).then( () =>{
      this.saveSound()          
      db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + this.lastbreakPoint + "/paths").get().then( pathSet =>{
        var mapDelete = pathSet.docs.map( pathDoc =>{
          console.log( pathDoc.id )
          return db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + this.lastbreakPoint + "/paths").doc(pathDoc.id).delete()
        })
        Promise.all( mapDelete ).then( () =>{
          for(let i = 0; i < this.paths.length; i++){
            let path = this.paths[i]
              db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + this.lastbreakPoint + "/paths").doc("path_" + i).set({"path":path})
          }
        })
      })

    },
    error=>{
      console.log("error reading breakpoints:" + error)
    })
  }
  loadBreakPoints(){

    db.collection(this.path).doc( this.drawing_id ).get().then( doc =>{
      let data = doc.data()
      console.log("document loaded " + data)
    })
    this.unsubscribe = db.collection(this.path + "/" + this.drawing_id + "/breakPoints").onSnapshot( breakPointSet =>{
      this.breakPoints.length = 0
      breakPointSet.docs.map( breakPointDoc =>{
        const breakPoint = breakPointDoc.data() 
        this.breakPoints.push(breakPoint)
        this.loadSound( breakPoint["id"], breakPoint["commentUrl"])
      })
      this.breakPoints.sort( 
        (a,b) => { 
          return parseFloat(a.id) - parseFloat(b.id) 
        })
     },
     error =>{
        console.log("ERROR breakpoints:" + error)
     })
  }
  updateLoadingStatus(e){
    console.log(e)
    var audioElement = e.srcElement as HTMLAudioElement
    audioElement.play()
  }


  onMoveToTime(seconds, stop=false){

    this.clear()
    this.eventsSubject.next(seconds);
    this.lastbreakPoint = seconds
    this.stopAfterPlaying = stop

    // now plays the sound
    this.onClickPlayUrl(seconds, stop) 

    /*
    this.audioBlob = null

    db.collection(this.path + "/" + this.drawing_id + "/breakPoints").doc( seconds ).get().then( doc =>{
      this.breakPointData = doc.data()
      var storageRef = storage.ref( this.breakPointData["commentPath"] )

      storageRef.getDownloadURL().then( audioBlob =>{

        //const audioUrl = URL.createObjectURL(audioBlob);
        this.audioBlob = audioBlob
        const audio = new Audio(audioBlob); 
        if( stop == false){
          var thiz = this
          audio.addEventListener('ended', (event) => {
            console.log("sound has ended")
            thiz.resumePlay()
          });       
        }
        try{
          audio.play()
        }
        catch(err){
          alert("error playing:" + err)
        }
               
      })
      
    }) 
    */
    db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + seconds + "/paths").get().then(pathSet =>{
      this.paths.length = 0
      pathSet.docs.map( doc =>{
        const ppts = doc.data()
        this.paths.push( ppts.path )
        this.paintPath( ppts.path )
      })
    })
  }
  onRestart(){
    this.lastbreakPoint = "0"
    this.eventsSubject.next("0");
  }

  /********* recording  */


  onStartRecording(){
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
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
    });    
  }
  onStopRecording(){
    this.mediaRecorder.stop();
    this.isRecording = false;
    this.save()
  }

  saveSound(){
    if( this.audioBlob != null ){
      const path = this.path + "/" + this.drawing_id + "/breakPoints" 
      const id = this.lastbreakPoint 
      const property = "comment"

      const bucketName = "organizations/" + this.organization_id + "/laboratoryGrades/" + this.drawing_id + "/breakpoint_" + this.lastbreakPoint + ".wav"

    
      var storageRef = storage.ref( bucketName )

      var uploadTask = storageRef.put(this.audioBlob, { contentType: 'audio/wav'})
      var element = document.getElementById("commentStatus")
      var fileLoadObserver = new FileLoadObserver(storageRef, path, id, property, element );
      uploadTask.on("state_change", fileLoadObserver)
    }       
  }

  onDelete( id ){

    const bucketName = "organizations/" + this.organization_id + "/laboratoryGrades/" + this.drawing_id + "/breakpoint_" + id + ".wav"
    var storageRef = storage.ref( bucketName )
    storageRef.delete().then( () =>{
      console.log("file deleted")
    })
    .then(() =>{
      db.collection(this.path + "/" + this.drawing_id + "/breakPoints").doc( id ).delete().then( data =>{
        console.log("deleted")
      })
    })
    .catch( reason =>{
      console.log("there has been an error:" + reason)
    })
    
    
  }


  play(audioBuffer, stop) {
    var thiz = this
    var source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);
    source.addEventListener("ended", (e) =>{
      if( stop == false){
        this.resumePlay()
      }
    })    
    source.start();

  };

  unmute(){
    this.play(this.yodelBuffer, true);
  }

  unlock() {
    console.log("unlocking")
    this.play(this.yodelBuffer, true);
  }


  onClickPlayUrl(seconds, stop){
    this.play( this.buffers[seconds], stop )
  }
  onClickPlay(seconds){

    this.clear()
    this.eventsSubject.next(seconds);
    this.lastbreakPoint = seconds
    this.audioBlob = null

    db.collection(this.path + "/" + this.drawing_id + "/breakPoints").doc( seconds ).get().then( doc =>{
      this.breakPointData = doc.data()
      var storageRef = storage.ref( this.breakPointData["commentPath"] )

   
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
               thiz.play(audioBuffer, false);
             },
             error =>
               console.error(error)
          ))
          var source = this.context.createBufferSource()
          source.buffer = this.audioBlob;
          source.connect(this.context.destination);
          source.start();           
        }
        xhr.onerror = e =>{
          console.log( "error:" + e)
        }
        xhr.open('GET', url);
        xhr.send();   

         
      })
    })
  }

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
           thiz.buffers[id] = audioBuffer
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
}