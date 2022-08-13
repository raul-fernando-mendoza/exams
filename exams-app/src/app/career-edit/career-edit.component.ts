import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserLoginService } from '../user-login.service';
import { db, storage } from 'src/environments/environment';
import { Career, Group, Level, Materia } from '../exams/exams.module';
import { ExamFormService } from '../exam-form.service';
import { UserPreferencesService } from '../user-preferences.service';
import * as uuid from 'uuid';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { MatDialog } from '@angular/material/dialog';
import { DialogListSelectDialog } from '../list-select/list-select-dialog';
import { Observer } from 'rxjs';
import videojs from 'video.js'


@Component({
  selector: 'app-career-edit',
  templateUrl: './career-edit.component.html',
  styleUrls: ['./career-edit.component.css']
})
export class CareerEditComponent implements OnInit, OnDestroy {

  id = null

  organization_id = null

  snapshots:Array<any> = []



  c = this.fb.group({
    id: [null, Validators.required],
    career_name:[null, Validators.required], 
    pictureUrl:[null],
    iconUrl:[],
    videoUrl:[],  
    description:[null],
    levels:new FormArray([])
  })

  pictureUrlStatus = {
    status:""
  }
  videoUrlStatus = {
    status:""
  }  

  constructor(
      private fb: FormBuilder
    , private route: ActivatedRoute
    , private userLoginService:UserLoginService
    , public formService:ExamFormService
    , public userPreferencesService:UserPreferencesService
    , public dialog: MatDialog
    , public router:Router
    ) { 
      this.id = this.route.snapshot.paramMap.get('id')
      this.organization_id =  this.userPreferencesService.getCurrentOrganizationId()
    }
  ngOnDestroy(): void {
    this.snapshots.map( func =>{
      func()
    })
  }


  getFormArrayControls( fg:FormGroup , property):AbstractControl[]{
    var fa:FormArray = fg.controls[property] as FormArray
    return fa.controls
  }  
  ngOnInit(): void {
    this.update()
  }
  
  update(){
    this.loadCareer()
  }

  loadCareer():Promise<void>{
    return new Promise<void>( (resolve, reject) =>{
      db.collection('careers').doc(this.id).get().then( doc =>{
        const career:Career = doc.data() as Career
        this.c.controls.id.setValue(career.id)  
        this.c.controls.career_name.setValue(career.career_name)
        this.c.controls.pictureUrl.setValue(career.pictureUrl)
        this.c.controls.videoUrl.setValue(career.videoUrl)
        this.loadLevels(career.id, this.c.controls.levels as FormArray).then( () =>{
          resolve()
        })
      },
      reason =>{
        alert("ERROR: reading career" + reason)
        reject()
      })  
    })  
  }
  onCreateLevel(career_id){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { carrer_id:career_id, label:"Ciclo", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createLevel(career_id, data.name).then( ()=>{
          
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
  
  createLevel(career_id, level_name:string):Promise<void>{
    var id = uuid.v4()
  
    const nivel:Level = {
      id:id,
      level_name:level_name,
      isDeleted:false
    }
    return db.collection('careers/' + career_id + "/levels").doc(id).set(nivel)
  }
  loadLevels( career_id:string, levels:FormArray):Promise<void>{
    
    return new Promise<void>((resolve, reject)=>{
      var unsubscribe = db.collection("careers/" + career_id + "/levels")
      .where("isDeleted","==",false)
      .onSnapshot( set =>{
        levels.controls.length = 0
        var map = set.docs.map( doc =>{          
          const level:Level = doc.data() as Level
          var level_FG = this.fb.group({
            id:[level.id],
            level_name: [ level.level_name ],
            groups: new FormArray([])
          })
          levels.controls.push( level_FG )
          return this.loadGroups( career_id, level.id, level_FG.controls.groups as FormArray)
        })
        Promise.all( map ).then( ()=>{
          levels.controls.sort( (a,b) =>{
            var a_FG = a as FormGroup
            var b_FG = b as FormGroup
            return a_FG.controls.level_name.value > b_FG.controls.level_name.value? 1:-1
          })
          resolve()
        })
      })
      this.snapshots.push( unsubscribe )
    })
  }

  onCreateGroup(career_id, level_id){
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { career_id:career_id, level_id:level_id, label:"Group", name:""}
    });
  
    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      if( data != undefined ){
        console.debug( data )
        this.createGroup(data.career_id, data.level_id,  data.name).then( ()=>{
          
        },
        reason =>{
          alert("ERROR can not create group:" + reason)
        })
      }
      else{
        console.debug("none")
      }
    });
  }
  
  createGroup(career_id, level_id, group_name:string):Promise<void>{
    var id = uuid.v4()
  
    const nivel:Group = {
      id:id,
      group_name:group_name,
      isDeleted:false
    }
    return db.collection('careers/' + career_id + "/levels/" + level_id + "/groups").doc(id).set(nivel)
  }
  loadGroups( career_id:string, level_id, groups:FormArray):Promise<void>{
    
    return new Promise<void>((resolve, reject)=>{
      var unsubscribe = db.collection("careers/" + career_id + "/levels/" + level_id + "/groups")
      .where("isDeleted", "==", false)
      .onSnapshot( set =>{
        groups.controls.length = 0
        var map = set.docs.map( doc =>{
          const group:Group = doc.data() as Group
          var fg = this.fb.group({
            id:[group.id],
            group_name: [ group.group_name ],
            materias: new FormArray([])
          })
          groups.controls.push( fg )
          return this.loadMaterias(career_id, level_id, group.id, fg.controls.materias as FormArray)
        })
        Promise.all( map ).then( ()=>{
          groups.controls.sort( (a,b) =>{
            var a_FG = a as FormGroup
            var b_FG = b as FormGroup
            return a_FG.controls.group_name.value > b_FG.controls.group_name.value ? 1:-1
          })
          resolve()
        })
      },
      reason => {
        alert("can not read groups:" + reason)
      })
      this.snapshots.push( unsubscribe )
    })
  }

  
  onAddMateria(career_id, level_id, group_id:string){
      db.collection("materias")
      .where("isDeleted", "==", false)
      .where("organization_id","==", this.organization_id)
      .get()
      .then( set =>{
        var materias:Materia[] = [] 
        var map = set.docs.map( doc =>{
          const materia = doc.data() as Materia
          materias.push(materia)
        })
        materias.sort( (a,b)=>{
          return a.materia_name > b.materia_name ? 1: -1
        })
        const dialogRef = this.dialog.open(DialogListSelectDialog, {
          height: '400px',
          width: '250px',
          data: { 
            career_id:career_id, 
            level_id:level_id, 
            group_id:group_id,
            label:"Materia", 
            name:"",
            options:materias,
            property:"materia_name",
            value:null
          }
        });
      
        dialogRef.afterClosed().subscribe(data => {
          console.log('The dialog was closed');
          if( data != undefined ){
            console.debug( data )
            this.AddMateria(data.career_id, data.level_id, data.group_id, data.value).then( ()=>{
              
            },
            reason =>{
              alert("ERROR can not create group:" + reason)
            })
          }
          else{
            console.debug("none")
          }
        });
    
        
      })

  }

  AddMateria(career_id, level_id, group_id, materia_id){
    const id = materia_id
    return db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").doc(id).set(
      {
        id:id,
        materia_id:materia_id
      }
    )
  }

  loadMaterias( career_id:string, level_id:string, group_id:string, materias:FormArray):Promise<void>{
    return new Promise<void>((resolve, reject)=>{
      
      var unsubscribe = db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").onSnapshot( set =>{
        materias.controls.length = 0
        var map = set.docs.map( doc =>{
          const materia:Materia = doc.data() as Materia
          var fg = this.fb.group({
            id:[materia.id],
            materia_name: null
          })
          materias.controls.push( fg )
          return db.collection("materias").doc( materia.id).get().then( doc =>{
            const materiaDetail:Materia = doc.data() as Materia
            fg.controls.materia_name.setValue( materiaDetail.materia_name )
          })
        })
        Promise.all( map ).then( ()=>{
          materias.controls.sort( (a,b) =>{
            var a_FG = a as FormGroup
            var b_FG = b as FormGroup
            return a_FG.controls.materia_name.value > b_FG.controls.materia_name? 1:-1
          })
          resolve()
        })
      },
      reason => {
        alert("can not read groups:" + reason)
      })
      this.snapshots.push( unsubscribe )
    })
  }

  onRemoveMateria(career_id, level_id, group_id, materia_id){
    db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" + group_id + "/materias").doc(materia_id).delete().then( () =>{
      
    },
    reason=>{
      alert("ERROR: removing materia")
    })
  }
  onRemoveGroup(career_id, level_id, group_id){
    db.collection("careers/" + career_id + "/levels/" + level_id + "/groups/" ).doc(group_id).delete().then( () =>{
      
    },
    reason =>{
      alert("ERROR: remove group")
    })
  }
  onRemoveLevel(career_id, level_id){
    db.collection("careers/" + career_id + "/levels"  ).doc(level_id).delete().then( () =>{
      
    },
    reason =>{
      alert("ERROR: remove group")
    })
  }
 
  async selectFile(event) {


    var selectedFiles = event.target.files;
    const property = event.srcElement.name

    const bucketName = "organizations/" + this.organization_id + "/careers/" + this.id + "/" + property + ".jpg"

    var file:File = selectedFiles[0]
    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(property + "Status")
    var fileLoadObserver = new FileLoadObserver(this.c.controls[property] as FormControl, storageRef, this.id, property, element );
    uploadTask.on("state_change", fileLoadObserver)
  } 
  removePropertyValue(property){
    const json = {}
    json[property] = null

    
    db.collection("careers").doc(this.id).update( json ).then( () =>{
      console.log("property was removed")
      this.c.controls[property].setValue(null)
    })
  }

  async selectVideo(event) {
    var selectedFiles = event.target.files;
    const property = event.srcElement.name
    
    /*
    var myPlayer = videojs.getPlayers() ;
    myPlayer.src("https://firebasestorage.googleapis.com/v0/b/thoth-dev-346022.appspot.com/o/organizations%2Fraxacademy%2Fcareers%2F38252a95-c669-4fbe-9e03-bc17019c4461%2FvideoUrl.jpg?alt=media&token=865123d4-ee5c-40de-b6cd-c5ed83bd8107");
    myPlayer.load()    
    */

    const bucketName = "organizations/" + this.organization_id + "/careers/" + this.id + "/" + property + ".mp4"

    var file:File = selectedFiles[0]
    var storageRef = storage.ref( bucketName )

    var uploadTask = storageRef.put(file)
    var element = document.getElementById(property + "Status")
    var fileLoadObserver = new VideoLoadObserver(this.c.controls[property] as FormControl, storageRef, this.id, property, element , this.router);
    uploadTask.on("state_change", fileLoadObserver)
  } 


}

class FileLoadObserver implements Observer<any>  {
  constructor( 
    private fc:FormControl,
    private storageRef,
    private career_id:string, 
    private propertyName:string,
    private element:HTMLElement){

  } 
  next=(snapshot =>{
    console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
    this.element.innerText = snapshot.bytesTransferred + " of " + snapshot.totalBytes
  })
  error=(cause =>{
    console.log("error:" + cause)
  })
  complete=( () =>{
    this.element.innerText = ""
    console.log("complete" + this.career_id + " " + this.propertyName)
    console.log("Completed"); // progress of upload
    this.storageRef.getDownloadURL().then( url =>{
      console.log(url)        
      if( this.career_id ){
        var obj = {}
        obj[this.propertyName]=url
        db.collection("careers").doc(this.career_id).update(obj).then( () =>{
          console.log(`update as completed ${this.career_id} / ${url}`)
        })
      }
      else{
        this.fc.setValue(url)
      }
    },
    reason =>{
      console.log("ERROR on url" + reason)
    })      
  });
}

class VideoLoadObserver implements Observer<any>  {
  constructor( 
    private fc:FormControl,
    private storageRef,
    private career_id:string, 
    private propertyName:string,
    private element:HTMLElement,
    private router){

  } 
  next=(snapshot =>{
    console.log(snapshot.bytesTransferred + " of " + snapshot.totalBytes); // progress of upload
    this.element.innerText = snapshot.bytesTransferred + " of " + snapshot.totalBytes
  })
  error=(cause =>{
    console.log("error:" + cause)
  })
  complete=( () =>{
    this.element.innerText = ""
    console.log("complete" + this.career_id + " " + this.propertyName)
    console.log("Completed"); // progress of upload
    this.storageRef.getDownloadURL().then( url =>{
      console.log(url)        
      if( this.career_id ){
        var obj = {}
        obj[this.propertyName]=url
        db.collection("careers").doc(this.career_id).update(obj).then( () =>{
          console.log(`update as completed ${this.career_id} / ${url}`)
          let currentUrl = this.router.url;
          window.location.reload()
        })
      }
      else{
        this.fc.setValue(url)
      }
    },
    reason =>{
      console.log("ERROR on url" + reason)
    })      
  });
}