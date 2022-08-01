import { AfterViewInit, Component, OnInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { EiApplicationTableDataSource, MateriaItemNode } from './ei-tipo-list-datasource';
import { Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { UserLoginService } from '../user-login.service';
import { Career, Exam,  ExamRequest, Materia, Group, Nivel, copyObj} from 'src/app/exams/exams.module'
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { db } from 'src/environments/environment';
import { UserPreferencesService } from '../user-preferences.service';
import { SortingService } from '../sorting.service';

import * as uuid from 'uuid';
import { DialogMateriaDialog } from '../materia-edit/materia-edit';

@Component({
  selector: 'app-ei-tipo-list',
  templateUrl: './ei-tipo-list.component.html',
  styleUrls: ['./ei-tipo-list.component.css']
})

export class EiTipoListComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<MateriaItemNode>;
  dataSource: EiApplicationTableDataSource;


  materiaGroupListener = null  
 
  materiaItemNodes:Array<MateriaItemNode> = []

  careerList:Array<Career> = []

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [  'materia_name'] ;
  submitting = false
  open_transactions:Set<string> = new Set()



  constructor( private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    , private userLoginService:UserLoginService
    , private fb: FormBuilder
    , public dialog: MatDialog
    , private userPreferencesService:UserPreferencesService
    , private sortingService:SortingService
  ) {}

  ngOnDestroy(): void {
 
  }

  materiasList:FormGroup = this.fb.group({
    materias: new FormArray([])
  })

  NivelBuilder(nivel:Nivel):MateriaItemNode{
    var materiaItem:MateriaItemNode = {
      nivel_id:nivel.id,
      nivel_name:nivel.nivel_name,
      required_in_carrers_ids:[],
      nodeClass:"nivel",
      children:[]
    }
    return materiaItem
  }

  GroupBuilder(nivel:MateriaItemNode, group:Group):MateriaItemNode{
    var materiaItem:MateriaItemNode = {
      nivel_id:nivel.nivel_id,
      nivel_name:nivel.nivel_name,
      group_id:group.id,
      group_name:group.group_name,
      required_in_carrers_ids:[],
      nodeClass:"group",
      children:[]
    }
    return materiaItem
  }  


  MateriaItemBuilder(nivel:MateriaItemNode, group:MateriaItemNode, materia:Materia):MateriaItemNode{
    var materiaItem:MateriaItemNode = {
      nivel_id:nivel.nivel_id,
      nivel_name:nivel.nivel_name,
      group_id:group.exam_id,
      group_name:group.group_name,
      materia_id:materia.id,
      materia_name:materia.materia_name,            
      required_in_carrers_ids:[],
      nodeClass:"materia",
      children:[]
    }
    return materiaItem
  }
  ExamBuilder(nivel:MateriaItemNode, group:MateriaItemNode, materia:MateriaItemNode, exam:Exam):MateriaItemNode{
    var materiaItem:MateriaItemNode = {
      nivel_id:nivel.nivel_id,
      nivel_name:nivel.nivel_name,
      group_id: group.group_id,
      group_name:group.group_name,
      materia_id:materia.materia_id,
      materia_name:materia.materia_name,            
      exam_id:exam.id,
      exam_name:exam.label,
      required_in_carrers_ids:exam.required_in_carrers_ids,
      nodeClass:"exam",
      children:[]
    }
    return materiaItem
  }  
  

  loadCareers(){
    const query = db.collection("careers").where("owners","array-contains",this.userLoginService.getUserUid()).where("isDeleted","==",false).where("organization_id","==",this.userPreferencesService.getCurrentOrganizationId())
    
    query.get().then( 
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
        this.careerList = this.sortingService.sortBy(this.careerList,["career_name"])

        for( var i=0; i< this.careerList.length; i++){
          this.displayedColumns.push( this.careerList[i].career_name )
        }
        this.displayedColumns.push( 'id' ) 
      },
      reason => {
        alert(reason)
      }
    )  

  }



  transactionStart(id){
    this.open_transactions.add(id)
  }
  transactionComplete(id){
    this.open_transactions.delete(id)
    if(this.open_transactions.size == 0){
      //this.materiaItems = this.sortingService.sortBy(this.materiaItems,["nivel","materia_name"])
      this.dataSource = new EiApplicationTableDataSource(this.materiaItemNodes)
      //this.dataSource.sort = this.sort;
      //this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource; 
    }
  }

  ngOnInit() {
    this.loadCareers()
  }

  ngAfterViewInit() {
    
    this.update()
  }
  update(){
    this.materiaItemNodes.length = 0
    const query = db.collection("niveles").
      where("owners","array-contains",this.userLoginService.getUserUid()).
      where("isDeleted","==",false).
      where("organization_id","==",this.userPreferencesService.getCurrentOrganizationId())
    this.transactionStart("niveles")
    query.get().then( 
      set =>{
        this.materiaItemNodes.length = 0
        var docs = set.forEach(doc =>{          
          var nivel:Nivel = {
            organization_id:doc.data().organization_id,
            id:doc.id,
            nivel_name:doc.data().nivel_name,
            isDeleted:doc.data().isDeleted
          }
          var nivelNode:MateriaItemNode = this.NivelBuilder(nivel)
          this.materiaItemNodes.push(
            nivelNode
          )
          this.materiaItemNodes = this.sortingService.sortBy(this.materiaItemNodes,["nivel_name"])
          this.loadGroups(nivelNode)   
        })
        this.transactionComplete("niveles")
      },
      reason => {
        alert(reason)
      }
    )  
  }

  loadGroups(nivel:MateriaItemNode){
    nivel.children.length = 0
    const query = db.collection("groups"). 
      where("owners","array-contains",this.userLoginService.getUserUid()). 
      where("isDeleted","==",false).
      where("nivel_id","==",nivel.nivel_id)
    this.transactionStart("groups")
    this.materiaGroupListener = query.get().then( 
      set =>{
        nivel.children.length = 0
        var docs = set.forEach(doc =>{          
          var group:Group = {
            id:doc.id,
            group_name:doc.data().group_name
          }

          var groupItem:MateriaItemNode = this.GroupBuilder(nivel, group)

          nivel.children.push(
            groupItem
          )
          nivel.children = this.sortingService.sortBy(nivel.children,["group_name"])
          this.loadMaterias(nivel, groupItem)
   
        })
        
        this.transactionComplete("groups")
         
        console.log( "***DONE***" )
      },
      reason => {
        alert(reason)
      }
    )  
  }

  loadMaterias(nivel:MateriaItemNode, group:MateriaItemNode){
    group.children.length = 0
    const query = db.collection("materias").
    where("owners","array-contains",this.userLoginService.getUserUid()).
    where("isDeleted","==",false).
    where("group_id","==",group.group_id)
    this.transactionStart("materias")
    query.get().then( 
      set =>{
        group.children.length = 0
        var docs = set.forEach(doc =>{   
                 
          var materia:Materia ={
            id:doc.data().id,
            materia_name:doc.data().materia_name,
            required_in_carrers_ids:doc.data().required_in_carrers_ids
          }


          var materiaItem:MateriaItemNode = this.MateriaItemBuilder(nivel, group, materia)

          group.children.push(
            materiaItem
          )
          group.children = this.sortingService.sortBy(group.children,["materia_name"])
          this.LoadExams(nivel, group, materiaItem)    
        })
        
        this.transactionComplete("materias")
         
        console.log( "***DONE***" )
      },
      reason => {
        console.error("ERROR reading materias:" + reason)
      }
    )  
  }

  LoadExams(nivel:MateriaItemNode, group:MateriaItemNode, materia:MateriaItemNode){
    materia.children.length = 0
    const query = db.collection("exams").
    where("owners","array-contains",this.userLoginService.getUserUid()).
    where("isDeleted","==",false).
    where("materia_id","==",materia.materia_id)
    this.transactionStart("exams")
    query.get().then( 
      set =>{
        materia.children.length = 0
        var docs = set.forEach(doc =>{
          var exam:Exam = {
            materia_id:materia.materia_id, 

            id:doc.id,
            label:doc.data().label,  
         
            isDeleted:doc.data().isDeleted,
            owners:doc.data().owners,
            required_in_carrers_ids:doc.data().required_in_carrers_ids,
          }

          var examItem:MateriaItemNode = this.ExamBuilder(nivel, group,  materia, exam)
          materia.children.push(
            examItem
          )
          materia.children = this.sortingService.sortBy(materia.children,["exam_name"])
        })
        this.transactionComplete("exams")
      },
      reason => {
        alert(reason)
      }
    )  
  }

  
  onEdit(row_id){
    this.router.navigate(['/ei-tipo-edit',{id:row_id}]);
  }
  onDeleteExam(exam_id){
    db.collection("exams").doc(exam_id).update({"isDeleted":"true"}).then(
      result =>{
        console.log("exam delted:" + result)
      }
    )
  }

  onDuplicateExam(materiaItem:MateriaItemNode){
    this.submitting = true
    
    this.duplicateExam(materiaItem["exam_id"],materiaItem["materia_id"], materiaItem["exam_name"] + "_Copy").then( () =>{
      this.submitting = false
      this.update()
    },
    reason=>{
      alert("duplicate failed" + reason)
    })
  }

  duplicateExam(exam_id:string, new_materia_id:string, label:string):Promise<void>{
    var _resolve
    var _reject
    return new Promise<null>((resolve, reject)=>{
      _resolve = resolve
      _reject = reject
      var req:ExamRequest = {
        exams:{
          id:exam_id,
          label:label
        }
      }
      this.userLoginService.getUserIdToken().then( token => {
        this.examImprovisacionService.firestoreApiInterface("dupDocument", token, req).subscribe(
          data => { 
            var exam:Exam = data["result"]
            db.collection("exams").doc(exam.id).update({
              materia_id:new_materia_id
            }).then(()=>{
              _resolve()
            })
            
          },   
          error => {  
            console.error( "ERROR: duplicando examen:" + JSON.stringify(req))
            _reject()
          }
        )
      },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
        this.submitting = false
      }) 
    })    
  }

  onChange(materiaItem:MateriaItemNode, career_id:string){
    console.debug(materiaItem, career_id)
    if( materiaItem.required_in_carrers_ids.includes(career_id) ){
      var idx = materiaItem.required_in_carrers_ids.findIndex(e=>{
        return e === career_id
      })
      materiaItem.required_in_carrers_ids.splice(idx, 1);
    }
    else{
      materiaItem.required_in_carrers_ids.push( career_id )
      
    }
    if( materiaItem.nodeClass == "materia"){
      db.collection("materias").doc(materiaItem.materia_id).update({"required_in_carrers_ids": materiaItem.required_in_carrers_ids});
    }
    else if( materiaItem.nodeClass == "exam") {
      db.collection("exams").doc(materiaItem.exam_id).update({"required_in_carrers_ids": materiaItem.required_in_carrers_ids});

    }
  }

/***** create Nivel  */  
  onCreateNivel(){
  const dialogRef = this.dialog.open(DialogNivelDialog, {
    height: '400px',
    width: '250px',
    data: {organization_id:this.userPreferencesService.getCurrentOrganizationId(), nivel_name:"" }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    if( result != undefined ){
      console.debug( result )
      this.createNivel(this.userPreferencesService.getCurrentOrganizationId(), result.nivel_name)
    }
    else{
      console.debug("none")
    }
  });
}

async createNivel(organization_id:string, nivel_name:string){
  var id = uuid.v4()

  const nivel:Nivel = {
    organization_id:organization_id,
    id:id,
    nivel_name:nivel_name,
    owners:[this.userLoginService.getUserUid()],
    isDeleted:false
  }
  const res = await  db.collection('niveles').doc(id).set(nivel);
  this.update()
}

onNivelEdit(nivel){
  const dialogRef = this.dialog.open(DialogNivelDialog, {
    height: '400px',
    width: '250px',
    data: {id:nivel.nivel_id, nivel_name:nivel.nivel_name }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    if( result != undefined ){
      console.debug( result )
      db.collection('niveles').doc(nivel.nivel_id).update({nivel_name:result.nivel_name});
    }
    else{
      console.debug("none")
    }
  });
}


/***** create group  */  
onCreateGroup(nivel){
  const dialogRef = this.dialog.open(DialogGroupDialog, {
    height: '400px',
    width: '250px',
    data: {organization_id:this.userPreferencesService.getCurrentOrganizationId(), group_name:"" }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    if( result != undefined ){
      console.debug( result )
      this.createGroup(nivel.nivel_id, result.group_name, result.evaluation_type)
    }
    else{
      console.debug("none")
    }
  });
}

createGroup(nivel_id:string, group_name:string, evaluation_type:number){
  var id = uuid.v4()

  const group:Group = {
    nivel_id:nivel_id,
    id:id,
    group_name:group_name,
    evaluation_type:evaluation_type,
    owners:[this.userLoginService.getUserUid()],
    isDeleted:false
  }
  db.collection('groups').doc(id).set(group);
  this.update()
}

  async onGroupEdit(row){
  const doc = await db.collection("groups").doc(row.group_id).get()
  const dialogRef = this.dialog.open(DialogGroupDialog, {
    height: '400px',
    width: '250px',
    data: {id:doc.data().id, group_name:doc.data().group_name, evaluation_type:doc.data().evaluation_type }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    if( result != undefined ){
      console.debug( result )
      db.collection('groups').doc(row.group_id).update({group_name:result.group_name});
      this.update()
    }
    else{
      console.debug("none")
    }
  });
}


/***** create materia */
  onCreateMateria(group){
    const dialogRef = this.dialog.open(DialogMateriaDialog, {
      height: '400px',
      width: '250px',
      data: {group_id:group.group_id, materia_name:"" }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined && result != ''){
        console.debug( result )
        var materia:Materia = result
        this.createMateria(materia).then( () =>{
          this.update()
        },
        reason => {
          console.error("ERROR creating materia:" + reason)
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
  createMateria(materia:Materia):Promise<void>{
    materia.id = uuid.v4()
    materia.owners = [this.userLoginService.getUserUid()]
    materia.isDeleted = false

    return  db.collection('materias').doc(materia.id).set(materia)

  }

  async onEditMateria(row){
    const doc = await db.collection('materias').doc(row.materia_id).get()
    const d = doc.data()
    var materia:Materia = {
      id:d.id,
      materia_name:d.materia_name,    
    }

    const dialogRef = this.dialog.open(DialogMateriaDialog, {
      height: '400px',
      width: '250px',
      data: materia
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.update()
    });


  }  
/* CREATE EXAM */
  onCreateExam(materia:MateriaItemNode){

    const dialogRef = this.dialog.open(DialogExamDialog, {
      height: '400px',
      width: '250px',
      data: {materia_id:materia.materia_id, label:"" }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if( result != undefined ){
        console.debug( result )
        this.createExam(materia.materia_id, result.label)
      }
      else{
        console.debug("none")
      }
    });
  }

  async createExam(materia_id:string, exam_name:string){
  
    var id = uuid.v4()
    const exam:Exam = {
      materia_id:materia_id,

      id:id,
      label:exam_name,
     
      owners:[this.userLoginService.getUserUid()],
      isDeleted:false,
      isRequired:false,
      required_in_carrers_ids:[]
    }
    const res = await  db.collection('exams').doc(id).set(exam);
    console.debug( "create exam:" + res )

    this.update()
  
  }
  onDuplicateMateria(row:MateriaItemNode){
    this.duplicateMateria(row).then( () =>{
      console.log("duplication completed")
      this.update()
    })

  }

  duplicateMateria(row:MateriaItemNode):Promise<void>{
    var _resolve
    return new Promise((resolve, reject) =>{
      _resolve = resolve
      db.collection("materias").doc(row.materia_id).get().then( doc =>{      
        var data = doc.data()
        data["id"] = uuid.v4()
        data["materia_name"] = data["materia_name"] + "_copy"
        db.collection('materias').doc(data["id"]).set(data).then( () =>{
          // no duplicate all exams
          db.collection("exams")
          .where("owners","array-contains",this.userLoginService.getUserUid())
          .where("materia_id","==",row.materia_id)
          .where("isDeleted","==",false).get().then(set => {
            var map = set.docs.map( doc =>{
              return this.duplicateExam(doc.data().id, data["id"], doc.data().label)
            })
            Promise.all(map).then( ()=>{
              _resolve()
            })
          })
        })
      },
      reason => {
        console.error("materia can not be read:" + reason)
      })    
    })

  }
  onRemoveMateria(row:MateriaItemNode){
    if( !confirm("Esta seguro de querer borrar la materia:" + row.materia_name) ){
      return
    }
    else{
      db.collection("materias").doc(row.materia_id).update({"isDeleted":true}).then(()=>{
        this.update() 
      })

    }
    
  }  
}





/****** Nivel dlg */

/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'nivel-dlg',
  templateUrl: 'nivel-dlg.html',
})
export class DialogNivelDialog { 
  constructor(
    public dialogRef: MatDialogRef<DialogNivelDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Nivel) {}
}


/****** group dlg */
/* do not forget to add the dialog to the app.module.ts*/
@Component({
  selector: 'group-dlg',
  templateUrl: 'group-dlg.html',
})
export class DialogGroupDialog { 

  evaluationTypes = [
    {'id':'1','name':'Obligatioria'},
    {'id':'2','name':'Opcional 1 requerida'},
    {'id':'3',"name":'Opcional 2 requeridas'},
    {'id':'3',"name":'Curso'}
  ]
  
  constructor(
    public dialogRef: MatDialogRef<DialogGroupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Group) {}

}



/* do not forget to add the dialog to the app.module.ts*/
@Component({
selector: 'exam-dlg',
templateUrl: 'exam-dlg.html',
})
export class DialogExamDialog { 

constructor(

  public dialogRef: MatDialogRef<DialogExamDialog>,
  @Inject(MAT_DIALOG_DATA) public data: Exam) {}

}
