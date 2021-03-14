import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-expansion-test',
  templateUrl: './expansion-test.component.html',
  styleUrls: ['./expansion-test.component.css']
})
export class ExpansionTestComponent implements OnInit {
  panelOpenState = false;

  constructor() { }

  ngOnInit(): void {
  }

}
