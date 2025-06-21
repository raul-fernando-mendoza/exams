import { Component, NgZone, ViewChild, OnInit, signal, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators } from '@angular/forms';
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
import { ParameterListComponent } from './parameter-list.component';

@Component({
  selector: 'app-ei-tipo-edit',
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

    ,ParameterListComponent

  ],    
  templateUrl: './ei-tipo-edit.component.html',
  styleUrls: ['./ei-tipo-edit.component.css']
})



export class EiTipoEditComponent implements OnInit , OnDestroy{




  e = this.fb.group({
    id: [null, Validators.required],
    isDeleted:[false],
    label:["Nombre de la materia", Validators.required],   
    description:[""],
    isRequired:[false],
    parameters: new UntypedFormArray([])
  })
  
  materia_id:string
  exam_id:string
  submitting = signal(false)
  materia = signal<Materia|null>(null)
  exam = signal<Exam|null>(null)
  unsubscribe: () => void;




  constructor(private fb: UntypedFormBuilder
    , private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private formBuilder: UntypedFormBuilder
    , private _ngZone: NgZone
    , public dialog: MatDialog
    , private userLoginService: UserLoginService) {
      this.materia_id = this.route.snapshot.paramMap.get('materia_id')
      this.exam_id = this.route.snapshot.paramMap.get('exam_id')
  }
  ngOnDestroy(): void {
    this.unsubscribe;
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }  
  
  getFormGroupArray (fg:UntypedFormGroup, controlname:string): UntypedFormGroup[] {
    if( fg == null){
      console.error("ERRO controls for " + controlname + " in " + fg)
    }
    var fa:UntypedFormArray =  fg.controls[controlname] as UntypedFormArray
    if( fa == null){
      console.error("I can not find controls for:" + controlname)
    }
    return fa.controls as UntypedFormGroup[]
  }

  ngOnInit(): void {
    this.loadExamType()
  }

  loadExamType(): void {
      this.submitting.set(true)
      db.collection("materias").doc(this.materia_id).get().then( (doc) =>{
          this.submitting.set(false)
          let newMateria = doc.data() as Materia
          this.materia.set(newMateria)    
      })
      this.unsubscribe = db.collection("materias/" + this.materia_id + "/exams").doc(this.exam_id).onSnapshot( 
        snapshot =>{
          let newExam = snapshot.data() as Exam
          this.e.controls.id.setValue(newExam.id)
          this.e.controls.label.setValue(newExam.label)
          this.e.controls.description.setValue( newExam.description ? newExam.description : "" )
          this.e.controls.isRequired.setValue(newExam.isRequired ? newExam.isRequired : false)          
          this.exam.set( newExam )
        }
      )    
  }
}
