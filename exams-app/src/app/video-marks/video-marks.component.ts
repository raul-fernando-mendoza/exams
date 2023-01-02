import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { db , storage} from 'src/environments/environment';
import { FileLoadObserver } from "../load-observers/load-observers.module"
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import videojs from 'video.js';


const BLACKBOARD = 'blackboard'
@Component({
  selector: 'app-video-marks',
  templateUrl: './video-marks.component.html',
  styleUrls: ['./video-marks.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VideoMarksComponent implements OnInit , AfterViewInit, OnDestroy{

  currentTime

  @ViewChild(BLACKBOARD) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('target') target: ElementRef;

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

  mouseDown:boolean = false

  isPlaying = false

  paths = []



  breakPoints = [] 

  unsubscribe = null

  lastbreakPoint = "0"

  
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
  videoDuration = null

  isMarkerActive:boolean = false
  isMarkerEdited:boolean = false
  startMarker:number = null
  loopDuration = 0
  percentage = 0

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
  onCurrentTime(currentTime){
    for( let i = 0; this.isPlaying == true && i< this.breakPoints.length ; i++){
      let breakPoint = this.breakPoints[i]
      if( parseFloat(this.lastbreakPoint) < parseFloat(breakPoint.id) && 
          parseFloat(breakPoint.id) <= parseFloat( currentTime )
          ){
        this.playMarker( breakPoint , false)
        break;
      }
    }
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


    var options = {
      fluid: false,
      autoplay: false,
      controls: false,
      width:640,
      height:480,
      sources: [{
          src: this.source,
          type: "video/mp4",
      }],
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
        if( thiz.isMarkerActive ){
          if( thiz.player.currentTime() > (thiz.startMarker + thiz.loopDuration) ){
            thiz.player.currentTime( thiz.startMarker )
          }
        }
      })
      this.on("playing",function onTimeUpdate() {
        thiz.isPlaying = true
        //thiz.isPlaying.emit(true)
      })  
      this.on("pause",function onTimeUpdate() {
        thiz.isPlaying = false
        //thiz.isPlaying.emit(false)
      })
   
      
    });
     
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
  } 
  
  @HostListener('touchstart', ['$event'])
  touchstart(e) {
    console.log("touch down:" + e.target["id"] + " " +  e)
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



  resumePlay() {
    this.isMarkerActive = false
    this.clear()
    this.paths.length = 0
    this.ppts.length = 0
    this.player.volume(1.0)
    this.player.play();    
  }  

  save(){
    
    this.lastbreakPoint = this.startMarker.toFixed(2)

    db.collection(this.path + "/" + this.drawing_id + "/breakPoints").doc(this.lastbreakPoint).set({"id":this.lastbreakPoint,"loopDuration":this.loopDuration}).then( () =>{
      this.saveSound()          
      db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + this.lastbreakPoint + "/paths").get().then( pathSet =>{
        var mapDelete = pathSet.docs.map( pathDoc =>{
          console.log( pathDoc.id )
          return db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + this.lastbreakPoint + "/paths").doc(pathDoc.id).delete()
        })
        Promise.all( mapDelete ).then( () =>{
          var promiseArray:Promise<void>[] = []
          for(let i = 0; i < this.paths.length; i++){
            let path = this.paths[i]
              var p = db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + this.lastbreakPoint + "/paths").doc("path_" + i).set({"path":path})
              promiseArray.push(p)
          }
          Promise.all( promiseArray ).then( ()=>{
            this.resetMarker()
          })
          
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
      this.sounds.length = 0
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

  playMarker(breakpoint, stop=false){

    // now plays the sound

    
    this.startMarker = parseFloat( breakpoint["id"] ) 
    this.loopDuration = breakpoint["loopDuration"]
    this.isMarkerActive = true

    this.clear()
    this.player.currentTime(this.startMarker);
    this.player.volume(0.3)
    if( this.loopDuration > 0){
      this.player.play()
    }
    else{
      this.player.pause()
    }
    this.lastbreakPoint =  this.startMarker.toFixed(2)


    db.collection(this.path + "/" + this.drawing_id + "/breakPoints/" + this.startMarker + "/paths").get().then(pathSet =>{
      this.paths.length = 0
      pathSet.docs.map( doc =>{
        const ppts = doc.data()
        this.paths.push( ppts.path )
        this.paintPath( ppts.path )
      })
      this.playSound( this.sounds[this.startMarker], stop )
       
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


  playSound(audioBuffer, stop) {
    var thiz = this
    var source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);
    source.addEventListener("ended", (e) =>{
      if( stop == true){
        this.player.pause()
        this.isMarkerActive = false
        this.player.volume(1.0)
      }
      else{
        this.resumePlay()
      }
    })    
    source.start();

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

  playVideo(){
      if( this.isPlaying ){
        this.player.pause()
      }
      else{
        this.player.play()
        this.lastbreakPoint=this.player.currentTime()
      }
      this.resetMarker()
      
  } 
  onStartEditMarker(){
      this.player.pause()
      this.startMarker = this.player.currentTime() 
      this.loopDuration = 0
      this.isMarkerActive = true
      this.isMarkerEdited = true
  }  

  onSlide(value:number) {
    console.log("This is emitted as the thumb slides");
    var duration = this.player.duration()
    var newTime = duration * (  value / 100)
    this.player.currentTime(newTime)
    this.resetMarker()
  }  

  showCurrentTime(){
    this.currentTime = this.player.currentTime().toFixed(1)
    this.videoDuration = this.player.duration().toFixed(1)
    this.percentage = Math.floor( (this.currentTime / this.videoDuration) * 100)  
 
  }
  backward(){
    this.resetMarker()
    var currentTime = this.player.currentTime()
    if(currentTime > 1){
      this.player.currentTime(currentTime - 1)
      this.startMarker = currentTime - 1
      this.lastbreakPoint=this.startMarker.toFixed(2)
    } 
    else{
      this.player.currentTime( 0 )
      this.startMarker = 0
      this.lastbreakPoint=( 0.0 ).toFixed(2)
    }   
  }
  forward(){
    this.resetMarker()
    var currentTime = this.player.currentTime()
    if( (currentTime + 1) < this.player.duration() ){
      this.player.currentTime( currentTime + 1 )
      this.startMarker = currentTime + 1
      this.lastbreakPoint = this.startMarker.toFixed(2)
    }
    else{
      var duration = this.player.duration()
      this.player.currentTime( duration )
      this.startMarker = duration
      this.lastbreakPoint = duration
    }
  }

  displayTime( value:number ){
    if( value != null){
      return value.toFixed(1)
    }
    else return ""
  }

  stop(){
    if( this.isPlaying ) {
      this.player.pause()
    }
    else{
      this.player.play()
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
    this.isMarkerActive = false
    this.resetMarker()
    this.isMarkerEdited = false

  }
  resetMarker(){
    this.clear()
    this.paths.length = 0
    this.ppts.length = 0    
    this.loopDuration = 0
    this.startMarker = null
    this.isMarkerActive = false
    this.player.volume(1.0)
  }

  onMute(){
    var isMuted = this.player.muted()
    this.player.muted( !isMuted )
  }

  onSpeedChange($event){
    this.player.playbackRate($event.value)
  }
}

