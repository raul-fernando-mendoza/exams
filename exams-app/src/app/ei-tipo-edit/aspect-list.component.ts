import { Component, OnInit, signal, OnDestroy, Input } from '@angular/core';
import {  FormGroup, FormBuilder } from '@angular/forms';
import { BusinessService} from '../business.service';
import { TextFieldModule} from '@angular/cdk/text-field';
import { UserLoginService } from '../user-login.service';
import { CriteriaRequest, Criteria, Aspect, AspectRequest} from 'src/app/exams/exams.module'

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

interface AspectItem{
  aspect:Aspect
  fg:FormGroup
}

@Component({
  selector: 'app-aspect-list',
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
  ],    
  templateUrl: './aspect-list.component.html',
  styleUrls: ['./aspect-list.component.css']
})



export class AspectListComponent implements OnInit , OnDestroy{
  @Input() materia_id:string 
  @Input() exam_id:string 
  @Input() parameter_id:string
  @Input() criteria_id:string


  submitting = signal(false)
  aspects = signal<Array<AspectItem>|null>(null)
  unsubscribe: () => void;

  constructor(private fb:FormBuilder
    , private businessService: BusinessService
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
    this.unsubscribe = db.collection("materias/" + this.materia_id + "/exams/" + this.exam_id + "/parameters/" + this.parameter_id + "/criterias/" + this.criteria_id + "/aspects/").onSnapshot( 
      set =>{
        console.log("aspects have changed")
        let newAspects = new Array<AspectItem>()
        set.docs.forEach( a =>{
          let newAspect = a.data() as Aspect

          var newfg = this.fb.group({
            id:[newAspect["id"]],
            label:[newAspect["label"]],
            idx:[newAspect["idx"]],
            description:[newAspect["description"]],
            initiallySelected:[newAspect["initiallySelected"]]            
          })            
        
          let newAspectItem:AspectItem = {
            aspect: newAspect,
            fg: newfg
          }
          newAspects.push(newAspectItem)
        })
        newAspects.sort( (a,b)=>a.aspect.idx > b.aspect.idx ? 1 : -1)
        this.aspects.set(newAspects)
      },
      onError=>{
        console.log("Error:" +  onError)
      }
    )      
  }
  
  delAspect(p:FormGroup){

    if( !confirm("Esta seguro de querer borrar el aspect") ){
      return
    }
    this.submitting.set(true); 
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id:this.criteria_id,
              aspects:{
                id:p.controls.id.value
              }
            }
          }
        }
      }
    }

    this.userLoginService.getUserIdToken().then( token => {
      this.businessService.firestoreApiInterface("delete", token, req).subscribe(
        data => {
          console.log("aspect has been erased")
          this.submitting.set(false); 
        },
        error => {
          alert( "aspect no pudo ser borrado" )
          this.submitting.set(false); 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

onChangeAspect(c:FormGroup){
  console.log("change aspect")
  var req:AspectRequest= {
    materias:{
      id:this.materia_id,
      exams:{
        id:this.exam_id,
        parameters:{
          id:this.parameter_id,
          criterias:{
            id:this.criteria_id,
            aspects:{
              id:c.controls.id.value,
              label:c.controls.label.value,
              description:c.controls.description.value,
            }
          }
        }
      }
    }
  }

  this.userLoginService.getUserIdToken().then( token => {
    this.submitting.set(true)
    this.businessService.firestoreApiInterface("update",token, req).subscribe(
      data => {
        this.submitting.set(false)
        console.log("aspect update completed:" + c.controls.label.value + " " + c.controls.initiallySelected.value)
      },
      error => {
        this.submitting.set(false)
        alert("error onChangeAspect:" + error.error)
        console.log(error.error)
      }
    )
  },
  error => {
    alert("Error in token:" + error.errorCode + " " + error.errorMessage)
  })
}

upAspect(c:FormGroup, idx:number) {
    console.log("upAspect")
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,          
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id:this.criteria_id,
              aspects:{
                id: c.controls.id.value,
                idx:c.controls.idx.value-1
              }
            }
          }
        }
      }
    }
    this.userLoginService.getUserIdToken().then( token => { 
      this.submitting.set(true)
      this.businessService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
        data => {
          this.submitting.set(false)
          console.log("completing up aspect")
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

  downAspect(c:FormGroup, idx:number) {
    console.log("downCriteria")
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,          
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id: this.criteria_id,
              aspects:{
                id:c.controls.id.value,
                idx:c.controls.idx.value+1
              }
            }
          }
        }
      }
    }
    
    this.userLoginService.getUserIdToken().then( token => { 
      this.submitting.set(true)
      this.businessService.firestoreApiInterface("moveSubCollectionIndex", token, req).subscribe(
        data => {
          this.submitting.set(false)
          console.log("aspecto down completed")
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
 

  onNewAspect(){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { materia_id:this.materia_id, label:"Aspect", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data ){
        console.debug( data )
        this.newAspect(data.name)
      }
      else{
        console.debug("none")
      }
    });

  }

newAspect( label:string  ){
   
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{      
            id: this.parameter_id, 
            criterias:{
              id:this.criteria_id,
              aspects:{
                id:null,
                label:label,
                idx:this.aspects().length,
                description:"" 
              }
            }
          }
        }
      }
    }
    this.userLoginService.getUserIdToken().then( token => {
      this.submitting.set(true)
      this.businessService.firestoreApiInterface("addSubCollection", token, req).subscribe(
        data => {
          this.submitting.set(false)
          console.log(" aspect add has completed")
        },
        error => {
          this.submitting.set(false)
          alert("error nuevo aspecto:" + error.error)
          
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }

  dupAspect( c:FormGroup ){
    var req:AspectRequest = {
      materias:{
        id:this.materia_id,
        exams:{
          id:this.exam_id,
          parameters:{
            id:this.parameter_id,
            criterias:{
              id:this.criteria_id,
              aspects:{
                id:c.controls.id.value
              }
            }
          }
        }
      }
    }
    
    this.userLoginService.getUserIdToken().then( token => {
      this.submitting.set(true);
      this.businessService.firestoreApiInterface("dupSubCollection", token, req).subscribe(
        data => {
          console.log(" duplicate aspect has completed")
          this.submitting.set(false);         
        },
        error => {
          alert("error duplicando aspecto:" + error.error)
          this.submitting.set(false); 
        }
      )
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })
  }  

}