import { Component, OnInit , ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import videojs from 'video.js'

@Component({
  selector: 'app-vjs-player',
  templateUrl: './app-vjs-player.component.html',
  styleUrls: ['./app-vjs-player.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppVjsPlayerComponent implements OnInit {
  @ViewChild('target', {static: false}) target: ElementRef;
  @Input() options: {
    fluid: boolean,
    aspectRatio: string,
    autoplay: boolean
  }
  @Input() src: string


player: videojs.Player;

  constructor(private elementRef: ElementRef,) { 

  }

  ngOnInit(): void {
    this.player = videojs(this.target.nativeElement, this.options, function onPlayerReady() {
      console.log('onPlayerReady', this);
    });    
  }
  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
