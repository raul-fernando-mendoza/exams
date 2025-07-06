import { Component, Inject, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Career } from '../exams/exams.module';
import { SortingService } from '../sorting.service';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { MatDialog, MatDialogRef,  MAT_DIALOG_DATA} from '@angular/material/dialog';

import * as uuid from 'uuid';
import { UserLoginService } from '../user-login.service';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatDialogModule } from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-career-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   

    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule 

    ,MatDialogModule  
    ,MatProgressSpinnerModule  
    ,MatMenuModule 
    ,MatCardModule  
    ,MatGridListModule  
 
  ],    
  templateUrl: './career-list.component.html',
  styleUrls: ['./career-list.component.css']
})
export class CareerListComponent implements OnInit, OnDestroy {

  careers = signal<Array<Career>>( null )

  submitting = false
  unsubscribe = null
  organization_id = null
  isAdmin = false

  destroyed = new Subject<void>();
  currentScreenSize: string;
  numCols = signal(1)

  // Create a map to display breakpoint names for demonstration purposes.
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);  

  constructor( private sortingService:SortingService
    , private router: Router
    , public dialog: MatDialog
    , private userPreferencesService:UserPreferencesService
    , private userLoginService:UserLoginService
    ) { 
      this.organization_id =  this.userPreferencesService.getCurrentOrganizationId()
      if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
        this.isAdmin = true
      } 
      inject(BreakpointObserver)
        .observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Medium,
          Breakpoints.Large,
          Breakpoints.XLarge,
        ])
        .pipe(takeUntil(this.destroyed))
        .subscribe(result => {
          for (const query of Object.keys(result.breakpoints)) {
            if (result.breakpoints[query]) {
              this.currentScreenSize = this.displayNameMap.get(query) ?? 'Unknown';
              switch( this.currentScreenSize ){
                case  'XSmall': this.numCols.set(1);
                      break;
                case  'Small': this.numCols.set(1);
                      break;
                case  'Medium':this.numCols.set(2);
                      break;
                case  'Large':this.numCols.set(2);
                      break;
                case  'XLarge':this.numCols.set(2);
                      break;               
              }
            }
          }
        });      

    }
  ngOnDestroy(): void {
    this.unsubscribe()
    this.destroyed.next();
    this.destroyed.complete();    
  }



  ngOnInit(): void {
    this.loadCareers()
  }

  loadCareers():Promise<void>{
    
    return new Promise<void>((resolve, reject) =>{
      const query = db.collection("careers")
      .where("isDeleted","==",false)
      .where("organization_id","==",this.userPreferencesService.getCurrentOrganizationId())
      
      this.submitting = true
      this.unsubscribe =query.onSnapshot( 
        set =>{
          this.submitting = false
          let careers = new Array<Career>()
          set.docs.map(doc =>{
            var career:Career = doc.data() as Career           
            careers.push(
              career
            )
          })
          careers.sort( (a,b)=>{
            return a.career_name > b.career_name ? 1 : 0
          })
          
          console.log( "***DONE careers***" )
          this.careers.set( careers )
          resolve()
        },
        reason => {
          console.error("ERROR: " + reason)
          reject()
        }
      )  
    })
  }
  onEdit(career_id){
    this.router.navigate(['/career-edit',{id:career_id}]);
  }

  onDelete(career:Career){
    if( !confirm("Esta seguro de querer borrar la carrera:" +  career.career_name) ){
      return
    }      
    db.collection("careers").doc(career.id).update({"isDeleted":true}).then(()=>{
        console.log("careers deleted")
      }
    )    
  }

  onCreateCareer(){
    const dialogRef = this.dialog.open(CareerDialog, {
      height: '400px',
      width: '250px',
      data: {career_name:"" }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        this.createMateria(result.career_name).then( ()=>{
          console.log("carrer create")
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
  createMateria(career_name:string):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      var id = uuid.v4()

      const career:Career = {
        id:id,
        career_name:career_name,
        isDeleted:false,
        organization_id:this.userPreferencesService.getCurrentOrganizationId(),
        iconUrl:null,
        iconPath:null,
        description:null,
        pictureUrl:null,
        picturePath:null,
        pictureDescription:null,
        videoUrl:null,
        videoPath:null,
        videoDescription:null,
        
      }
      db.collection('careers').doc(id).set(career).then( ()=>{
          resolve()
        },
        reason => {
          alert("ERROR updating carrers:" + reason)
          reject()
        }
      )      
    })
  }
  isLoggedIn() : boolean{
    return this.userLoginService.getIsloggedIn()
  }  
  onCareerMyProgress(career_id:string){
    this.router.navigate(['career-user',{ user_uid:this.userLoginService.getUserUid(), career_id:career_id }])
  }   
  onCareerDetails(career_id:string){
    this.router.navigate(['career-edit',{ id:career_id }])
  }   
}

export interface CareerData {
  career_name: string
}

/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'career-dlg',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule     
    ,MatDialogModule 
 
  ],   
  templateUrl: 'career-dlg.html',
})
export class CareerDialog { 
  
  constructor(
    public dialogRef: MatDialogRef<CareerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CareerData) {}

  closeDialog() {
    this.dialogRef.close('Done');
  }

}
