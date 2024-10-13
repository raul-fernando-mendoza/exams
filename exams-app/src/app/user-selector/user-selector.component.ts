import {Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Optional, Output, Self} from '@angular/core';
import {AbstractControlDirective, FormControl, NgControl} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { UserLoginService } from '../user-login.service';
import { User } from '../exams/exams.module';
import { MatFormFieldControl } from '@angular/material/form-field';
import * as uuid from 'uuid';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.css'],
  providers: [{provide: MatFormFieldControl, useExisting: UserSelectorComponent,multi:true}]
})
export class UserSelectorComponent implements OnInit,OnDestroy,MatFormFieldControl<string> {
 
  @Output() userselected = new EventEmitter<string>()
  myControl = new FormControl<string|User>('');
  students: User[] = [];
  filteredOptions: Observable<User[]>;

  userUid = null

  constructor(
     private examImprovisacionService:ExamenesImprovisacionService
    ,private userLoginService:UserLoginService
    ,@Optional() @Self() public ngControl: NgControl
  ){
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this; 
    }
  }
  ngOnDestroy(): void {
    this.userselected.complete()
    this.stateChanges.complete()
  }

  writeValue(useruid: any): void {
    console.log( "writevalue:" +useruid)
    if( useruid ){
      this.examImprovisacionService.getUser( useruid ).then( user=>{
        let displayName = this.userLoginService.getDisplayNameForUser(user)
        let obj:User = {
          "uid":user.uid,
          "email":user.email,
          "displayName":displayName,
          "claims":user.claims
        } 
        this.myControl.setValue(user)     
      })
    }
    this.userUid= useruid
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
    if (this.userUid && this.userUid.length > 0){
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
    return this.userUid
  }
  set value(val: string | null) {
    this.userUid = val
    this.stateChanges.next( )
  }
  ngOnInit() {
    this.userLoginService.getUserIdToken().then( token =>{
      this.examImprovisacionService.authApiInterface("getUserList", token, {}).then(data => {
        let students = data["result"] as Array<any>;
        this.students = []
        for( let i =0; i<students.length; i++){
          let estudiante = students[i]
          let displayName = this.userLoginService.getDisplayNameForUser(estudiante)
          let obj:User = {
            "uid":estudiante.uid,
            "email":estudiante.email,
            "displayName":displayName,
            "claims":estudiante.claims
          }
          this.students.push(obj)
        }
        this.students.sort( (a,b)=> a.displayName.toUpperCase() > b.displayName.toUpperCase() ?  1 : -1 )
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => {
            const name = typeof value === 'string' ? value : value?.displayName;
            return name ? this._filter(name as string) : this.students.slice();
          }),
        );
      },
      error => {
          alert( "Error retriving estudiante" + error )
      }) 
    },
    error=>{
      console.log("error en el token")
    })


  }

  private _filter(value: string): User[] {
    const filterValue = value.toLowerCase();

    return this.students.filter(
      option => option.displayName.toLowerCase().includes(filterValue)
    );
  }

  displayFn(user: User): string {

    
    return user && user.displayName ? user.displayName : '';
  } 
  
  onUserChange($event){
    const val:string|User = this.myControl.value
    if( typeof val === 'string' && val != ""){
      var valStr:string =  val
      let listusers:User[] = this._filter(val)
      if(listusers && listusers.length==1){
        var user = listusers[0]
        this.myControl.setValue(user)
        this.userUid = user.uid
      }
      else{
        this.userUid = null
      }      
    }
    else{
      this.userUid=null
     
    }
    this.userselected.emit(this.userUid)
    this.stateChanges.next( this.userUid )
    this._onChange(this.userUid) 
  
  }
  onUserSelect(user:User){
    this.userUid=user.uid
    this.userselected.emit(this.userUid)
    this.stateChanges.next( this.userUid )
    this._onChange(this.userUid)
  }
}
