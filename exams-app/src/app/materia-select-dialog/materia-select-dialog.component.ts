import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Materia } from '../exams/exams.module';
import { UserPreferencesService } from '../user-preferences.service';
import { BusinessService } from '../business.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-materia-select-dialog',
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule 
    ,MatDialogModule
    ,MatSelectModule 
    ,ReactiveFormsModule     
  ],
  templateUrl: './materia-select-dialog.component.html',
  styleUrl: './materia-select-dialog.component.css'
})
export class MateriaSelectDialogComponent {
  organization_id:string
  materiasList = signal<Array<Materia>>(null)

  materiaForm = this.fb.group({
    materiaId:["", Validators.required]
  })


  constructor(
    private userPreferencesService:UserPreferencesService,
    public dialogRef: MatDialogRef<MateriaSelectDialogComponent>,
    private businessService: BusinessService,
    private fb:FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
  }

  ngOnInit(): void {
    this.LoadMaterias()
  }

  LoadMaterias(){
    this.businessService.getMaterias( this.organization_id ).then( materias =>{
      materias.sort((a,b) => {return a.materia_name > b.materia_name ? 1:-1})
      this.materiasList.set( materias )
    })
  }

  onSelectChange($event:MatSelectChange){
    console.log($event)
    let id = $event.value 
    let idx = this.materiasList().findIndex( e => e.id == id)
    if( idx >= 0){
      this.data = this.materiasList()[idx]
    }
  }

}
