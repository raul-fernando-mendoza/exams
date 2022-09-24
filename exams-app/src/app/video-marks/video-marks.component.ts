import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-marks',
  templateUrl: './video-marks.component.html',
  styleUrls: ['./video-marks.component.css']
})
export class VideoMarksComponent implements OnInit {

  currentTime

  constructor() { }

  ngOnInit(): void {
  }


  onCurrentTime($event){
    console.log("the time has chaged to:" + $event)
    this.currentTime = $event.toFixed(1)
  }
}
