import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Materia, OptionalContainer } from '../exams/exams.module';
import { UserPreferencesService } from '../user-preferences.service';
import { BusinessService } from '../business.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MateriaSelectDialogComponent } from '../materia-select-dialog/materia-select-dialog.component';
import { UserLoginService } from '../user-login.service';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-optionalContainer-dialog',
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule 
    ,MatDialogModule
    ,MatSelectModule 
    ,ReactiveFormsModule 
    ,MatBadgeModule    
  ],
  templateUrl: './optionalContainer-dialog.component.html',
  styleUrl: './optionalContainer-dialog.component.css'
})
export class OptionalContainerDialogComponent {

  organization_id = null
  isAdmin = false

  materias = signal<Array<Materia>>([])
  materiasApproved:Map<string, boolean>
 
  constructor(
    private userPreferencesService:UserPreferencesService,
    public dialogRef: MatDialogRef<MateriaSelectDialogComponent>,
    private businessService: BusinessService,
    private userLoginService:UserLoginService,
    public dialog: MatDialog,    
    @Inject(MAT_DIALOG_DATA) public data: any) {

       this.organization_id = this.userPreferencesService.getCurrentOrganizationId()

      if( this.userLoginService.hasRole("role-admin-" + this.organization_id) ){
        this.isAdmin = true
      }

      this.materiasApproved = this.data["materiasApproved"]
      this.materias.set(data["optionalContainer"].materias)
  }

  ngOnInit(): void {
  }

addMateriaToOptional(){
    const dialogRef = this.dialog.open(MateriaSelectDialogComponent, {
      height: '400px',
      width: '250px',
      data: {}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != null ){
        let idx = this.data["optionalContainer"].materias.findIndex( e => e.id == data["id"] )
        if( idx < 0){
          this.data["optionalContainer"].materias.push(data)
          this.materias.set( [...this.data["optionalContainer"].materias])
        }
        else{
          alert( "la materia ya existe")
        }
      }
      else{
        console.debug("none")
      }
    });

   
  }

  removeMateriaOptional(m:Materia){
    let idx =this.data["optionalContainer"].materias.findIndex( e => e.id == m.id )
    if( idx >= 0){
      this.data["optionalContainer"].materias.splice(idx,1)
      this.materias.set([...this.data["optionalContainer"].materias])
    }    
  } 
}
