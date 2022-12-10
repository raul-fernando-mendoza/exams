import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { UserLoginService } from '../user-login.service';
import { User } from '../exams/exams.module';


@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.css']
})
export class UserSelectorComponent implements OnInit {

  @Input() value:string  
  @Output() userselected = new EventEmitter<string>()
  myControl = new FormControl<string|User>('');
  students: User[] = [];
  filteredOptions: Observable<User[]>;

  constructor(
     private examImprovisacionService:ExamenesImprovisacionService
    ,private userLoginService:UserLoginService
  ){

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
    const user = this.myControl.value
    if( user == ''){
      this.userselected.emit(null)
    }
  }
  onUserSelect(user:User){
    this.userselected.emit(user.uid)
  }
}
