import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Materia } from '../exams/exams.module';
import { UserPreferencesService } from '../user-preferences.service';
import { BusinessService } from '../business.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StringService } from '../string.service';

@Component({
  selector: 'app-materia-select-dialog',
  imports: [
    CommonModule

    ,MatIconModule
    ,MatInputModule
    ,MatButtonModule 
    ,MatDialogModule
    ,MatSelectModule 

    ,FormsModule
    ,ReactiveFormsModule    
    ,ReactiveFormsModule 
    ,MatFormFieldModule
    ,MatAutocompleteModule  
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

  filteredOptions: Observable<Materia[]>;



  constructor(
    private userPreferencesService:UserPreferencesService,
    public dialogRef: MatDialogRef<MateriaSelectDialogComponent>,
    private businessService: BusinessService,
    private fb:FormBuilder,
    private stringService:StringService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.organization_id = userPreferencesService.getCurrentOrganizationId()
  }

  ngOnInit(): void {
    this.LoadMaterias().then( () =>{
      this.filteredOptions = this.materiaForm.controls.materiaId.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || '')),
      ) 
/*
      this.filteredOptions.subscribe( 
        next =>{

        }
      )
        */
    })
  }

  private _filter(value: string):Array<Materia> {
    console.log( "value changed to:" + value )
    

    if( value && typeof(value) ==  "string" && this.materiasList() ){
      const filterValue = value.toLowerCase();
      var filteredMaterias = this.materiasList().filter(option => {
        let materiaName = this.stringService.removeDiacritics( option.materia_name.toLowerCase() )
        let val = this.stringService.removeDiacritics(filterValue)
        let result = materiaName.includes(val)
        return result
      });
      return filteredMaterias
    }
    return this.materiasList() ? this.materiasList() : []
  }  

  displayFn(materia: Materia): string {
    return materia && materia.materia_name ? materia.materia_name : '';
  }

  LoadMaterias():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      this.businessService.getMaterias( this.organization_id ).then( materias =>{
        materias.sort((a,b) => {return a.materia_name > b.materia_name ? 1:-1})
        this.materiasList.set( materias )
        resolve(null)
      })      
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

  isValidSelection(){
    if( this.materiaForm.controls.materiaId.value!=null ){
      let materia:any = this.materiaForm.controls.materiaId.value
      if( this.materiasList() && this.materiasList().find( e => e.id == materia["id"])){
        return true
      }
    }
    return false;
  }

}
