import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Exam, Materia, MateriaEnrollment } from '../exams/exams.module';
import { db } from 'src/environments/environment';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog , MatDialogRef as MatDialogRef,  MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { UserPreferencesService } from '../user-preferences.service';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import * as uuid from 'uuid';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

interface MateriaItem{
  materia:Materia
  materiaEnrollment:MateriaEnrollment
  
}

@Component({
  selector: 'app-materia-list',
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
    ,MatButtonToggleModule
    ,MatProgressSpinnerModule
    ,MatMenuModule
    ,MatCardModule 
    ,MatGridListModule
    ,MatProgressBarModule
  ],    
  templateUrl: './materia-list.component.html',
  styleUrls: ['./materia-list.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MateriaListComponent implements OnInit , OnDestroy{

  materiasList = signal<Array<MateriaItem>>( null )
  materiaListOriginal = new Array<MateriaItem>()
 
  submitting = signal(false)

  organization_id:string
  isAdmin = false

  search = null

  

  unsubscribe = null
  userUid = null

  fg = this.fb.group({
    filter: [""],
    enrolledOnly:[false]
  })


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

  constructor(
 
      private router: Router
    , private userPreferenceService:UserPreferencesService
    , private userLoginService:UserLoginService
    , private examImprovisationService:ExamenesImprovisacionService
    , private dialog: MatDialog
    , private fb: FormBuilder
  ) { 
    this.organization_id = this.userPreferenceService.getCurrentOrganizationId()
    this.isAdmin = this.userLoginService.hasRole("role-admin-" + this.organization_id)
    this.userUid = this.userLoginService.getUserUid()

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
                case  'Small': this.numCols.set(2);
                      break;
                case  'Medium':this.numCols.set(3);
                      break;
                case  'Large':this.numCols.set(4);
                      break;
                case  'XLarge':this.numCols.set(5);
                      break;               
              }
            }
          }
        });      

  }
  ngOnDestroy(): void {
    this.unsubscribe()
  }

  ngOnInit(): void {

    this.update()
  }

  update(){
    this.loadMaterias()
  }


  applyFilter(){
    let filter = this.fg.controls.filter.value
    let newMateriaList = [...this.materiaListOriginal]

    let enrolledOnly = this.fg.controls.enrolledOnly.value
    if( enrolledOnly ){
      newMateriaList = this.materiaListOriginal.filter( (e) =>{
        if( e.materiaEnrollment && !e.materiaEnrollment.certificateUrl  )
          return true
        else
          return false
      })
    }

    if( filter ){
      newMateriaList = newMateriaList.filter( (e) =>{
        let materiaName = e.materia.materia_name.toLowerCase()
        return (materiaName.search(filter.toLowerCase()) !== -1 )
      })
    }  
    newMateriaList.sort( (a,b) => {return a.materia.materia_name > b.materia.materia_name? 1:-1})
    this.materiasList.set( newMateriaList )  
  }
  onApplyFilter(){
    this.applyFilter()
  }
  loadMaterias():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      this.submitting.set(true)
      this.unsubscribe = db.collection("materias")
      .where("organization_id","==", this.organization_id)
      .where("isDeleted","==", false)
      .onSnapshot( snapshot =>{
        this.submitting.set(false)
        this.materiaListOriginal.length = 0
        let transactions = []
        snapshot.docs.map( doc =>{
          
          const materia = doc.data() as Materia

          var materiaItem:MateriaItem = {
            materia:materia,
            materiaEnrollment:null
          }
          this.materiaListOriginal.push(materiaItem)
          //fill details
          let e = this.examImprovisationService.getMateriaEnrollment( this.organization_id, materia.id, this.userUid).then( materiaEnrollement =>{
            materiaItem.materiaEnrollment = materiaEnrollement
          }
          ,reason=>{
            console.log("ERROR when reading getMateriaEnrollment:" + reason)
          })
          transactions.push(e)
        })
        Promise.all( transactions ).then( ()=>{
          this.applyFilter()
        })        
        resolve()
      },
      reason =>{
        this.submitting.set(false)
        console.log("materias where not loaded:" + reason)
        reject(reason)
      })
    })
  }


  onEditMateria(materia:Materia){
    this.router.navigate(['/materia-edit',{materia_id:materia.id}]);
  }
  onCreateMateria(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { label:"Materia", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createMateria(data.name).then( (id)=>{
          this.router.navigate(['/materia-edit',{materia_id:id}]);
        },
        reason =>{
          alert("ERROR: removing level")
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
 
  

  createMateria( materia_name ):Promise<string>{
    return new Promise<string>( (resolve, reject) =>{
      const id =uuid.v4()
      this.submitting.set(true)
      db.collection("materias").doc(id).set({
        id:id,
        materia_name:materia_name,
        isDeleted:false,
        organization_id:this.organization_id
      }).then( () =>{
        this.submitting.set(false)
        console.log("materia created")
        resolve( id )
      },
      reason =>{
        this.submitting.set(false)
        alert("ERROR: Can not create materia:" + reason)
        reject( reason )
      })
    })

  }

  onRemoveMateria(materia_id, materia_name){
    if( !confirm("Esta seguro de querer borrar la materia:" + materia_name) ){
      return
    }
    else{
      this.submitting.set(true)
      db.collection("materias").doc(materia_id).update({"isDeleted":true}).then(()=>{
        this.submitting.set(false)
        this.update() 
      })

    }
    
  }  
  onDuplicateMateria(materia_id:string, materia_label:string){
    this.submitting.set(true)
    
    this.duplicateMateria(materia_id, materia_label).then( () =>{
      this.submitting.set(false)
      this.update()
    },
    reason=>{
      alert("duplicate failed" + reason)
      this.submitting.set(false)
    })
  }

  duplicateMateria(materia_id, materia_name:string):Promise<void>{
    
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject
      var req = {
        materias:{
          id:materia_id,

          materia_name:materia_name + "_copy"
        }
      }
      var options = {
        exceptions:["Reference","references","laboratory","Path","Url"]
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisationService.firestoreApiInterface("dupDocument", token, req, options).subscribe(
          data => { 
            var exam:Exam = data["result"]
            _resolve()
          },   
          error => {  
            console.error( "ERROR: duplicando examen:" + JSON.stringify(req))
            _reject()
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        this.submitting.set(false)
      }) 
    }) 
       
  }

  getShortDescription(str:string){
    if( str && str.length>80 ){
      return str.substring(1,100) + " ..."
    }
    return str
  }

  onEnrolledOnly(){
    this.applyFilter()
  }

  onRemoveFilter(){
    this.fg.controls.filter.setValue("")
    this.applyFilter()
  }
}
