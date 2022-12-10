import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { outputAst } from '@angular/compiler';
import {Component, ElementRef, Input, OnDestroy, OnInit, Output, EventEmitter , ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import videojs from 'video.js';

@Component({
  selector: 'app-vjs-player',
  templateUrl: './app-vjs-player.component.html',
  styleUrls: [
    './app-vjs-player.component.css'
  ],
  encapsulation: ViewEncapsulation.None,
})

export class AppVjsPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('target', {static: true}) target: ElementRef;

  // See options: https://videojs.com/guides/options
  @Input() options: {
      fluid: boolean,
      aspectRatio: string,
      autoplay: boolean,
      sources: {
          src: string,
          type: string,
      }[],
  };

  @Input() source:string
  @Input() controls:boolean = true
  @Input() events: Observable<string>;
  @Output() currentTime = new EventEmitter<string>();
  @Output() isPlaying = new EventEmitter<boolean>();

  player: videojs.Player;
  private eventsSubscription: Subscription;
  private isRunning = false
  

  constructor(
    private elementRef: ElementRef,
  ) {}

  // Instantiate a Video.js player OnInit
  ngOnInit() {

    if( this.events )
      this.eventsSubscription = this.events.subscribe((seconds) => this.play(seconds));

    var options = {
      fluid: false,
      autoplay: false,
      controls:this.controls,
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
        //console.log("time has changed" + thiz)
        thiz.showCurrentTime()
      })
      this.on("playing",function onTimeUpdate() {
        thiz.isRunning = true
        thiz.isPlaying.emit(true)
      })  
      this.on("pause",function onTimeUpdate() {
        thiz.isRunning = false
        thiz.isPlaying.emit(false)
      })            
    });
 
  }

  // Dispose the player OnDestroy
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }

  showCurrentTime(){
    let currentTime = this.player.currentTime();
    this.currentTime.emit(currentTime)
   
  }
  play(seconds){
    if( seconds != ""){
      this.player.currentTime(parseFloat(seconds))
      if( this.isRunning == false){
        this.player.play()
      }
      this.player.pause()
    }
    else{    
      if( this.isRunning == true)
        this.player.pause()
      else this.player.play()
    }
  }
}