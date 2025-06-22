import { Component, OnInit, signal, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {  FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service';
import { CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
import { take} from 'rxjs/operators';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UserLoginService } from '../user-login.service';
import { Exam, Parameter, ExamRequest, ParameterRequest, CriteriaRequest, AspectRequest, MateriaRequest, Materia} from 'src/app/exams/exams.module'
import { MatSelectChange} from '@angular/material/select';

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
import { CriteriaListComponent } from './criteria-list.component';

interface ParameterItem{
  parameter:Parameter
  fg:FormGroup
}

@Component({
  selector: 'app-parameter-list',
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
    ,CriteriaListComponent

  ],    
  templateUrl: './parameter-list.component.html',
  styleUrls: ['./parameter-list.component.css']
})



export class ParameterListComponent implements OnInit , OnDestroy{
  @Input() materia_id:string 
  @Input() exam_id:string 

  submitting = signal(false)
  parameters = signal<Array<ParameterItem>|null>(null)
  unsubscribe: () => void;

  constructor(private fb:FormBuilder
    , private route: ActivatedRoute
    , private router: Router
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
    this.unsubscribe = db.collection("materias/" + this.materia_id + "/exams/" + this.exam_id + "/parameters").onSnapshot( 
      set =>{
        let newParameters = new Array<ParameterItem>()
        set.docs.forEach( p =>{
          let newParameter = p.data() as Parameter

          var newfg = this.fb.group({
            id:[newParameter["id"]],
            label:[newParameter["label"]],
            scoreType:[newParameter["scoreType"]],
            idx:[newParameter["idx"]],
            description:[newParameter["description"]],
          })            
        
          let newParameterItem:ParameterItem = {
            parameter: newParameter,
            fg: newfg
          }
          newParameters.push(newParameterItem)
        })
        newParameters.sort( (a,b)=>a.parameter.idx > b.parameter.idx ? 1 : -1)
        this.parameters.set(newParameters)
      },
      onError=>{
        console.log("Error:" +  onError)
      }
    )      
  }
  
  delParameter(p:FormGroup){

    if( !confirm("Esta seguro de querer borrar el parametro") ){
      return
    }
    this.submitting.set(true); 
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id:p.controls.id.value
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("parameter has been erased")
          this.submitting.set(false);
        },
        error => {
          alert( "parametro no pudo ser borrado:"  + error)
          this.submitting.set(false); 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  onChangeParameter(p:FormGroup){
    console.log("parameter")
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,      
          parameters:{
            id:p.controls.id.value,
            label:p.controls.label.value,
            scoreType:p.controls.scoreType.value,
            description:p.controls.description.value,
          }      
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.examImprovisacionService.firestoreApiInterface("update", token, req).subscribe(
        data => {
          console.log(" parameter update has completed")
        },
        error => {
          alert("error:" + error.error)
          console.log(error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

upParameter(p:FormGroup, index:number){
    console.log("upParameter")

    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id: p.controls.id.value,
            idx:p.controls.idx.value-1
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
        data => {
          console.log("aspect upParameter has completed from:" + index + " to:" + (index-1))
        },
        error => {
          alert("error:" + error.error)
          console.log(error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })

  }


 downParameter(p:FormGroup, index:number){
    console.log("downParameter")

    var req :ParameterRequest= {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id: p.controls.id.value,
            idx:p.controls.idx.value+1
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => { 
      this.examImprovisacionService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
        data => {
          console.log("downParameter has completed from index:" + index + " to:" + (index+1))
        },
        error => {
          alert("error:" + error.error)
          console.log(error.error)
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })

  }
  onNewParameter(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { materia_id:this.materia_id, label:"Parametro", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.newParameter(data.name)
      }
      else{
        console.debug("none")
      }
    });

  }

  newParameter( label:string ){
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id:null,
            idx:this.parameters().length,
            scoreType:"starts",
            label:label          
          }
        }
  
      }
      
    }
    
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          console.log(" parameter add has completed")              
        },
        error => {
          alert("error nuevo parametro:" + error.error)
          
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  dupParameter(p:FormGroup){
  
    var req:ParameterRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id:p.controls.id.value
          }
        }
      }
    }

    this.submitting.set(true);
    
    this.userLoginService.getUserIdToken().then( token => {

      this.examImprovisacionService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" parameter add has completed")
          this.submitting.set(false);      
        },
        error => {
          alert("error nuevo parametro:" + error.error)
          this.submitting.set(false); 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    }) 
  }

}