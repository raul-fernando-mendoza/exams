import { Component, OnInit, signal, OnDestroy, Input } from '@angular/core';
import {  FormGroup, FormBuilder } from '@angular/forms';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service';
import { TextFieldModule} from '@angular/cdk/text-field';
import { UserLoginService } from '../user-login.service';
import { CriteriaRequest, Criteria} from 'src/app/exams/exams.module'

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { db } from 'src/environments/environment';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatDialog } from '@angular/material/dialog';
import { AspectListComponent } from './aspect-list.component';

interface CriteriaItem{
  criteria:Criteria
  fg:FormGroup
}

@Component({
  selector: 'app-criteria-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   
   
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,TextFieldModule
    
    ,MatProgressSpinnerModule 
    ,MatCheckboxModule
    ,MatToolbarModule 
    ,MatCardModule 
    ,MatExpansionModule 
    ,MatGridListModule 
    ,MatTabsModule 
    ,MatButtonToggleModule 
    ,MatMenuModule 
    ,MatInputModule 
    ,AspectListComponent
  ],    
  templateUrl: './criteria-list.component.html',
  styleUrls: ['./criteria-list.component.css']
})



export class CriteriaListComponent implements OnInit , OnDestroy{
  @Input() materia_id:string 
  @Input() exam_id:string 
  @Input() parameter_id:string


  submitting = signal(false)
  criterias = signal<Array<CriteriaItem>|null>(null)
  unsubscribe: () => void;

  constructor(private fb:FormBuilder
    , private examImprovisacionService: ExamenesImprovisacionService
    , public dialog: MatDialog
    , private userLoginService: UserLoginService) {
  }


  ngOnInit(): void {
    this.update()
  }
  ngOnDestroy(): void {
    this.unsubscribe();
  }  
  update(){
    this.unsubscribe = db.collection("materias/" + this.materia_id + "/exams/" + this.exam_id + "/parameters/" + this.parameter_id + "/criterias/").onSnapshot( 
      set =>{
        let newCriterias = new Array<CriteriaItem>()
        set.docs.forEach( c =>{
          let newCriteria = c.data() as Criteria

          var newfg = this.fb.group({
            id:[newCriteria["id"]],
            label:[newCriteria["label"]],
            idx:[newCriteria["idx"]],
            description:[newCriteria["description"]],
            initiallySelected:[newCriteria["initiallySelected"]]            
          })            
        
          let newParameterItem:CriteriaItem = {
            criteria: newCriteria,
            fg: newfg
          }
          newCriterias.push(newParameterItem)
        })
        newCriterias.sort( (a,b)=>a.criteria.idx > b.criteria.idx ? 1 : -1)
        this.criterias.set(newCriterias)
      },
      onError=>{
        console.log("Error:" +  onError)
      }
    )      
  }
  
  delCriteria(p:FormGroup){

    if( !confirm("Esta seguro de querer borrar el criterio") ){
      return
    }
    this.submitting.set(true); 
    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id:p.controls.id.value
            }
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("criteria has been erased")
          this.submitting.set(false); 
        },
        error => {
          alert( "criterio no pudo ser borrado" )
          this.submitting.set(false); 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

onChangeCriteria(c:FormGroup){
  console.log("criteria")
  var req:CriteriaRequest= {
    materias:{
      id:this.materia_id,
      exams:{
        id:this.exam_id,
        parameters:{
          id:this.parameter_id,
          criterias:{
            id:c.controls.id.value,
            label:c.controls.label.value,
            description:c.controls.description.value,
            initiallySelected:c.controls.initiallySelected.value,
          }
        }
      }
    }
  }

  this.userLoginService.getUserIdToken().then( token => {
    this.submitting.set(true)
    this.examImprovisacionService.firestoreApiInterface("update",token, req).subscribe(
      data => {
        this.submitting.set(false)
        console.log("criteria update completed:" + c.controls.label.value + " " + c.controls.initiallySelected.value)
      },
      error => {
        this.submitting.set(false)
        alert("error onChangeCriteria:" + error.error)
        console.log(error.error)
      }
    )
  },
  error => {
    alert("Error in token:" + error.errorCode + " " + error.errorMessage)
  })
}

upCriteria(c:FormGroup, idx:number) {
    console.log("upCriteria")
    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,          
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id: c.controls.id.value,
              idx:c.controls.idx.value-1
            }
          }
        }
      }
    }

    
    this.userLoginService.getUserIdToken().then( token => { 
      this.submitting.set(true)
      this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
        data => {
          this.submitting.set(false)
          console.log("completing up criteria")
        },
        error => {
          this.submitting.set(false)
          alert("error:" + error.error)
          console.log(error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  } 

  downCriteria(c:FormGroup, idx:number) {

    console.log("downCriteria")


    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,          
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id: c.controls.id.value,
              idx:c.controls.idx.value+1
            }
          }
        }
      }
    }
    
    this.userLoginService.getUserIdToken().then( token => { 
      this.submitting.set(true)
      this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
        data => {
          this.submitting.set(false)
        },
        error => {
          this.submitting.set(false)
          alert("error:" + error.error)
          console.log(error.error)
          
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  } 
 

  onNewCriteria(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { materia_id:this.materia_id, label:"Criteria", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data ){
        console.debug( data )
        this.newCriteria(data.name)
      }
      else{
        console.debug("none")
      }
    });

  }

newCriteria( label:string  ){
   
    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{      
            id: this.parameter_id, 
            criterias:{
              id:null,
              label:label,
              initiallySelected:true,
              idx:this.criterias().length,
              description:"" 
            }
          }
        }
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.submitting.set(true)
      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          this.submitting.set(false)
          console.log(" criteria add has completed")
        },
        error => {
          this.submitting.set(false)
          alert("error nuevo criterio:" + error.error)
          
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  dupCriteria( c:FormGroup ){
    var req:CriteriaRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id:c.controls.id.value
            }
          }
        }
      }
    }
    
    this.userLoginService.getUserIdToken().then( token => {
      this.submitting.set(true);
      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" criteria duplicate has completed")
          this.submitting.set(false);         
        },
        error => {
          alert("error duplicando criterio:" + error.error)
          this.submitting.set(false); 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }  

}