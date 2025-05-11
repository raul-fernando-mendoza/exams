import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Optional, Output, Self, ViewChild } from '@angular/core';
import { AbstractControlDirective, ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldControl as MatFormFieldControl } from '@angular/material/form-field';
import { MatInput as MatInput } from '@angular/material/input';
import { Observable, Observer, Subject } from 'rxjs';
import { storage  } from 'src/environments/environment';
import * as uuid from 'uuid';

@Component({
  selector: 'app-file-control',
  templateUrl: './file-control.component.html',
  styleUrls: ['./file-control.component.css'],
  providers: [{provide: MatFormFieldControl, useExisting: FileControlComponent,multi:true}]
})
export class FileControlComponent implements OnInit, AfterViewInit, OnDestroy, MatFormFieldControl<string> , ControlValueAccessor{

  @Input() private basepath:string=null
  @Input() private filename:string=null

  @Output() onLoad = new EventEmitter<string>()

  fullpath = null
  selectedFileName=null


  @ViewChild('status', {static: true}) statusElement: ElementRef;
  @ViewChild('filename', {static: true}) inputFileElement: ElementRef<HTMLInputElement>;


  constructor(@Optional() @Self() public ngControl: NgControl) { 

    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this; 
    }
  }
  ngOnDestroy(): void {
    this.stateChanges.complete()
    this.onLoad.complete()
  }
  ngAfterViewInit(): void {
    this.inputFileElement.nativeElement.placeholder = this._placeholder

  }
  writeValue(obj: any): void {
    console.log( "writevalue:" +obj)
    this.fullpath= obj
    if( this.fullpath ){
      this.selectedFileName = this.fullpath.split("/").reverse()[0]
      this.inputFileElement.nativeElement.value = this.selectedFileName
    }
    
  }
  _onChange = (value) =>{}
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  _onTouched =() => {}
  registerOnTouched(fn: any): void {
   this._onTouched =fn
  }
  isDisabled = false
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = false
  }

  get empty() {
    if (this.fullpath && this.fullpath.length > 0){
      return false
    }
    return true
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _disabled = false;  

  error= null
  get errorState(): boolean {
    return ( this.error != null)

  }  

  stateChanges = new Subject<void>();
  id=uuid.v4();
  focused: boolean;
  
  controlType: string = "file-loader";
  autofilled?: boolean;
  userAriaDescribedBy?: string;

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next( )
  }
  private _placeholder: string;

  setDescribedByIds(ids: string[]): void {
    
  }
  onContainerClick(event: MouseEvent): void {
    
  }

  @Input()
  get value(): string | null {
    return this.fullpath
  }
  set value(val: string | null) {
    this.fullpath = val
    this.stateChanges.next( )
  }

  ngOnInit(): void {
  }

  selectFile(event) {
    var selectedFiles = event.target.files;
    var file:File = selectedFiles[0]

    this.selectedFileName=file.name 

    if( file.size > 4000 * 1024*1024) {
      alert( "El archivo es muy grande")
      return
    }

    
    if( this.filename == null){
      this.fullpath = this.basepath + "/" + file.name.replace(" ","_")
    }
    else {
      this.fullpath = this.basepath + "/" + this.filename 
    }

    var storageRef = storage.ref( this.fullpath )

    var uploadTask = storageRef.put(file)

    var thiz = this
    uploadTask.on("state_change",
    {
      'next':
        (snapshot) =>{
          console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
          thiz.updateProgress( snapshot.bytesTransferred, snapshot.totalBytes )
        }
      ,
      'error':
        (cause) =>{
          thiz.updateError( cause )
        }
      ,
      'complete': () =>{
        thiz.updateCompleted()
      }
    })
  }   

  updateProgress(bytesTransferred, totalBytes){
    this.statusElement.nativeElement.innerText = bytesTransferred + " of " + totalBytes
  }
  updateError( cause ){
    this.statusElement.nativeElement.innerText = "Error:" + cause
    this.error = cause
  }
  updateCompleted( ){
    this.error =null
    this.statusElement.nativeElement.innerText = "Completado"
    this.inputFileElement.nativeElement.value = this.selectedFileName
    this._onChange(this.fullpath)
    this.stateChanges.next( )
    this.onLoad.next(this.fullpath)  
  }

  removePropertyValue(){

    var storageRef = storage.ref( this.fullpath )
    
    storageRef.delete().then( () =>{
      this.selectedFileName = ""
      this.statusElement.nativeElement.innerText = "Borrado"
      this.inputFileElement.nativeElement.value = this.selectedFileName
    })
    .catch( reason => {
      console.log("file was not deleted")      
    })
  }
}
