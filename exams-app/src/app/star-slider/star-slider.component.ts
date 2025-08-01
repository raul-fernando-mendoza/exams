import { EventEmitter, Output, signal, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-slider',
  standalone: true,
  imports: [
    CommonModule 
  ],   
  templateUrl: './star-slider.component.html',
  styleUrls: ['./star-slider.component.css'],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: StarSliderComponent,multi:true}],
})
export class StarSliderComponent  implements ControlValueAccessor {

  @ViewChild('location') location;
  //@Input() private disabled = false;
  @Output() private valueChange = new EventEmitter();
  widget;
  percentage = signal(100)
  constructor() { 

  }

  writeValue(obj: any): void {
    console.log("********** recibing value:" + obj)
    if(typeof obj === 'string' || obj instanceof String){
      this.percentage.set( Math.round( Number(obj) * 100 ) )
    }
    else{
      this.percentage.set( Math.round( obj*100 ) )
    }
  }
  _onChange:any
  registerOnChange(fn: any): void {
    //console.log("registering on change:" + fn)
    this._onChange = fn
  }
  _onTouched:any
  registerOnTouched(fn: any): void {
    this._onTouched = fn
  }
  _isDisabled:boolean
  setDisabledState?(isDisabled: boolean): void {
    this._isDisabled = isDisabled
  }
 
  onContainerClick(event: MouseEvent): void {
    if( !this._isDisabled ){
      let pct = this.getRoundPct( 50 + (event.offsetX/250) * 50 )
     
        this.percentage.set(pct) 
      // console.log("calling on change on " + this.percentage/100)
        this._onChange(this.percentage()/100)
        this.valueChange.emit(this.percentage()/100);
    }    
      
  }

  getRoundPct(pct):number{
    let p = 0

    if(pct<60){
      p = 60
    }
    else if(pct>=60 && pct<70){
      p = 70
    }
    else if(pct>=70 && pct<80){
      p = 80
    }
    else if(pct>=80 && pct<90){
      p = 90
    }  
    else if(pct>90 ){
      p = 100
    } 
    return p      
  }

}
