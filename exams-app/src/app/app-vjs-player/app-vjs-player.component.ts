import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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

  player: videojs.Player;

  constructor(
    private elementRef: ElementRef,
  ) {}

  // Instantiate a Video.js player OnInit
  ngOnInit() {



    var options = {
      fluid: false,
      autoplay: false,
      controls:true,
      width:640,
      height:480,
      sources: [{
          src: this.source,
          type: "video/mp4",
      }],
    };

    this.player = videojs(this.target.nativeElement, options, function onPlayerReady() {
      console.log('onPlayerReady', this);
    });

 
  }

  // Dispose the player OnDestroy
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}