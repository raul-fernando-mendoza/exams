import { Component,ViewChild, Inject, OnInit } from '@angular/core';
import { CareerTableDataSource } from './carrer-list-datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Career } from '../exams/exams.module';
import { SortingService } from '../sorting.service';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import * as uuid from 'uuid';
import { UserLoginService } from '../user-login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-career-list',
  templateUrl: './career-list.component.html',
  styleUrls: ['./career-list.component.css']
})
export class CareerListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<Career>;
  dataSource: CareerTableDataSource

  displayedColumns = [  'career_name', 'id']

  careerList:Array<Career> = []

  careerListener = null

  constructor( private sortingService:SortingService
    , private router: Router
    , public dialog: MatDialog
    , private userPreferencesService:UserPreferencesService
    , private userLoginService:UserLoginService
    ) { }

  ngOnInit(): void {
    this.update()
  }

  update(){
    this.loadCareers().then( () =>{
      this.careerList.sort( (a,b)=>{ return a.career_name > b.career_name ? 1:-1} )

      //this.materiaItems = this.sortingService.sortBy(this.materiaItems,["nivel","materia_name"])
      this.dataSource = new CareerTableDataSource(this.careerList)
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource; 
    })  
  }
  loadCareers():Promise<void>{
    this.careerList.length = 0
    return new Promise<void>((resolve, reject) =>{
      const query = db.collection("careers")
      .where("isDeleted","==",false)
      .where("organization_id","==",this.userPreferencesService.getCurrentOrganizationId())
      
      this.careerListener = query.get().then( 
        set =>{
          this.careerList.length = 0
          var docs = set.forEach(doc =>{
            var career:Career = {
              id:doc.id,
              career_name:doc.data().career_name,           
            }

            this.careerList.push(
              career
            )
      
          })
          console.log( "***DONE careers***" )
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

  onDelete(career_id){
    db.collection("careers").doc(career_id).update({"isDeleted":true}).then(()=>{
        console.log("careers deleted")
        this.update()
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
          this.update()
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
}

export interface CareerData {
  career_name: string
}

/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'career-dlg',
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
