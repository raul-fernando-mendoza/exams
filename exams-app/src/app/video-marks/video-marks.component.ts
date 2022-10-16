import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { db } from 'src/environments/environment';

const BLACKBOARD = 'blackboard'
@Component({
  selector: 'app-video-marks',
  templateUrl: './video-marks.component.html',
  styleUrls: ['./video-marks.component.css']
})
export class VideoMarksComponent implements OnInit , AfterViewInit, OnDestroy{

  currentTime

  @ViewChild(BLACKBOARD) canvas: ElementRef<HTMLCanvasElement>;
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

  drawing_id = "123"

  breakPoints = [] 

  unsubscribe = null

  lastbreakPoint = ""

  constructor() { }

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
      if( parseFloat(breakPoint.id) - 0.2 <= parseFloat( this.currentTime ) &&
          parseFloat( this.currentTime ) <= parseFloat(breakPoint.id) + 0.2 &&
          this.lastbreakPoint != breakPoint.id){
            this.lastbreakPoint = breakPoint.id
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
  
  eventsSubject: Subject<string> = new Subject<string>();

  resumePlay() {
    this.eventsSubject.next("");
    this.clear()
    this.paths.length = 0
    this.ppts.length = 0
  }  

  save(){
    
    let breakPoint:string = this.currentTime
    let id = 12
    let paths = this.paths

    db.collection('drawings').doc(this.drawing_id).set({"id":this.drawing_id})

    db.collection('drawings/' + this.drawing_id + "/breakPoints").doc(breakPoint).set({"id":breakPoint}).then( () =>{
      for(let i = 0; i < this.paths.length; i++){
        let path = this.paths[i]
          db.collection('drawings/' + this.drawing_id + "/breakPoints/" + breakPoint + "/paths").doc("path_" + i).set({"path":path})
      }
    })

  }
  loadBreakPoints(){

    db.collection('drawings').doc( this.drawing_id ).get().then( doc =>{
      let data = doc.data()
      console.log("document loaded " + data)
    })
    this.unsubscribe = db.collection('drawings/' + this.drawing_id + "/breakPoints").onSnapshot( breakPointSet =>{
      this.breakPoints.length = 0
      breakPointSet.docs.map( breakPointDoc =>{
        const breakPoint = breakPointDoc.data() 
        this.breakPoints.push(breakPoint)
      })
      this.breakPoints.sort( 
        (a,b) => { 
          return parseFloat(a.id) - parseFloat(b.id) 
        })
     })
  }

  onMoveToTime(seconds){
    this.clear()
    this.eventsSubject.next(seconds);
    db.collection('drawings/' + this.drawing_id + "/breakPoints/" + seconds + "/paths").get().then(pathSet =>{
      this.paths.length = 0
      pathSet.docs.map( doc =>{
        const ppts = doc.data()
        this.paintPath( ppts.path )
      })
    })
  }
  onRestart(){
    this.eventsSubject.next('0');
  }

}
