import { Optional } from '@angular/core';
import { HostBinding } from '@angular/core';
import { Self } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-star-slider',
  templateUrl: './star-slider.component.html',
  styleUrls: ['./star-slider.component.css'],
  providers: [{provide: MatFormFieldControl, useExisting: StarSliderComponent}],
})
export class StarSliderComponent implements OnInit,  MatFormFieldControl<StarSliderComponent>, ControlValueAccessor {

  
  constructor(@Optional() @Self() public ngControl: NgControl) { 
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }
  set value(value: StarSliderComponent | null) {
    console.log("value:" + value)
    this.stateChanges.next();
  }  
  writeValue(obj: any): void {
    this.percentage = this.getRoundPct( obj*100 )
  }
  _onChange:any
  registerOnChange(fn: any): void {
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

  stateChanges = new Subject<void>();
  @HostBinding() id = `example-tel-input-${StarSliderComponent.nextId++}`;
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;
   focused: boolean;
  empty: boolean;
  shouldLabelFloat: boolean;
  required: boolean;
  disabled: boolean;
  errorState: boolean;
  controlType?: string;
  autofilled?: boolean;
  userAriaDescribedBy?: string;

  ngOnDestroy() {
    this.stateChanges.complete();
  }
  static nextId = 0;
  

  setDescribedByIds(ids: string[]): void {
    throw new Error('Method not implemented.');
  }
  onContainerClick(event: MouseEvent): void {
    throw new Error('Method not implemented.');
  }

  tracking = false
  percentage = 100
  ngOnInit(): void {
  }



  getRoundPct(pct):number{
    let p = 0

    if(pct>0 && pct < 5){
      p = 0
    }
    else if(pct>5 && pct<=20){
      p = 20
    }
    else if(pct>20 && pct<=40){
      p = 40
    }
    else if(pct>40 && pct<=60){
      p = 60
    }
    else if(pct>60 && pct<=80){
      p = 80
    }  
    else if(pct>80 ){
      p = 100
    } 
    return p      
  }
  onStart($event){
    this.tracking =true
    /*
    let pct = this.getRoundPct( ($event.offsetX/250) * 100 )
    if(pct != this.percentage){
      this.percentage = pct
      this._onChange(this.percentage/100)
    }  
    */
  }
    
  onTrack($event){
    if( this.tracking ){
      let pct = this.getRoundPct( ($event.offsetX/250) * 100 )
      if(pct != this.percentage){
        this.percentage = pct
        this._onChange(this.percentage/100)
      }        
    }
  }
  onEnd($event){
    this.tracking = false
    let pct = this.getRoundPct( ($event.offsetX/250) * 100 )
    if(pct != this.percentage){
      this.percentage = pct
      this._onChange(this.percentage/100)
    }  
  }
  

}
