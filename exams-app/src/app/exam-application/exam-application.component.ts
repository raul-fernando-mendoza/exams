import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog'; 
import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';
//import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';



@Component({
  selector: 'app-exam-application',
  templateUrl: './exam-application.component.html',
  styleUrls: ['./exam-application.component.css']
})
export class ExamApplicationComponent {
 
  movimientos = [
    { id:1,label:"1 1 1/2"},
    { id:2,label:"2 1 1/2"},   
    { id:3,label:"3 1 1/2"},
    { id:4,label:"4 1 1/2"},
    { id:5,label:"5 1 1/2"}
  ]; 
  
  columnas = [
    {id:1,label:"movimiento"},
    {id:2,label:"pies"},
    {id:3,label:"shimmi"},
    {id:4,label:"palomas"},
    {id:5,label:"pordbra"},
    {id:6,label:"craneo"},
  ]

  razones_por_columna={
    movimiento:[
          {"id":1,"label":"movimiento 1"},
          {"id":2,"label":"movimiento 2"},
          {"id":3,"label":"movimeinto 3"}
        ],    
    pies:[
        {"id":1,"label":"pies 1"},
        {"id":2,"label":"pies 2"},
        {"id":3,"label":"pies 3"}
      ],
    shimmi: [
        {"id":1,"label":"shimmi 1"},
        {"id":2,"label":"shimmi 2"},
        {"id":3,"label":"shimmi 3"}
      ],
    palomas: [
        {"id":1,"label":"palomas 1"},
        {"id":2,"label":"palomas 2"},
        {"id":3,"label":"palomas 3"}
      ],
    pordbra: [
        {"id":1,"label":"pordebra 1"},
        {"id":2,"label":"pordebra 2"},
        {"id":3,"label":"pordebra 3"}
      ],
    craneo: [
      {"id":1,"label":"craneo 1"},
      {"id":2,"label":"craneo 2"},
      {"id":3,"label":"craneo 3"}
    ]    
  };

  movimientos_cancelados = [];

  valores = []; //valores[movimiento][columna]:boolean
    
  questions = []; //valores[movimiento][columna][i] : question

  otras = []; //valores[movimiento][columna]:string

  totales = [];

  granTotal = 0.0;
  
  
  initializeFormControls(){
    this.movimientos_cancelados = new Array(6).fill(false);
    this.totales = new Array(5).fill(0.5);

    for( let row=0 ; row< this.movimientos.length; row++ ){
      this.valores.push({
        movimiento:false,
        pies:false,
        shimmi:false,
        palomas:false,
        pordbra:false,
        craneo:false
      });
    }
    for( let row=0 ; row< this.movimientos.length; row++ ){
      for( let col=0 ; col< this.columnas.length; col++ ){
        this.questions.push({
          movimiento:[],
          pies:[],
          shimmi:[],
          palomas:[],
          pordbra:[],
          craneo:[]
        }
        )
      }
    }
    for( let row=0 ; row< this.movimientos.length; row++ ){
      for( let col=0 ; col< this.columnas.length; col++ ){
        this.otras.push({
          movimiento:"",
          pies:"",
          shimmi:"",
          palomas:"",
          pordbra:"",
          craneo:""
        })
      }
    }    
    /*
    var i = 0;
    for (i=0; i<this.db_posiciones.length; i++) {
      var p = this.db_posiciones[i]
      console.debug(p.id + " " + p.label);
      this.posicionesArray.push(this.newPosicion(
        p.id,
        p.label,
        p.movimiento,
        p.pies,
        p.shimmi,
        p.palomas,
        p.pordebra,
        p.craneo          
        )
      )
    }
  

    //return JSON.stringify(o);
    */
  } 
  exam_id: number;
  constructor(private route: ActivatedRoute
    , public dialog: MatDialog
    ) {}

  ngOnInit() {
    this.exam_id = Number(this.route.snapshot.paramMap.get('exam_id'));
    this.initializeFormControls();
    //alert( "receive:" + this.exam_id)
  }

  onSubmit() {
    alert('Thanks!');
  }

  openReasons( index:number, column:string){
    //alert("change:" + label + " " + column + " " + index + " " + checked);
    var par = {
      "questionsArr":[],
      "otra":""
    }
    for( let i=0; i<this.razones_por_columna[column].length; i++){
      var n = {
        "id":i,
        "label":this.razones_por_columna[column][i].label,
        "isSelected":this.questions[index][column][i] ? true: false
      }
      par.questionsArr.push(n);
    }  
    par.otra = this.otras[index][column];

    var reasons ;
    let dialogRef = this.dialog.open(ReasonSelectionComponent, {
      data: { questions:par },
      height: '400px',
      width: '600px',
      disableClose:false
    });    

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${JSON.stringify(result)}`); // Pizza!
      this.valores[index][column]=!result.isClean;
      for( let i=0; i<this.razones_por_columna[column].length; i++ ){
        this.questions[index][column][i] = result.questionsArr[i].isSelected;
      }
      this.otras[index][column] = result.otra;
      this.calculaTotales(index);
    }) 
    return reasons;
  }

  calculaTotales(row){
    var result:number = 0.0;
    for (const prop in this.valores[row]) {
      if( this.valores[row][prop] == false ){
        result = result + (0.5 / 6);
      }
    }
    this.totales[row] = result;

    var sum:number = 0.0;
    for( let i=0; i<this.totales.length; i++){
      sum = sum + this.totales[i];
    }
    this.granTotal = sum    
  }


  onChangeReason(idx:number, property:string, $event){
    if( this.movimientos_cancelados[idx] == false){
      this.openReasons( idx, property)
      
    }
  }
  getIsSelectedFor(idx:number, property:string){
    var value = this.valores[idx][property];
    return value;
  }
  onCancelRow(i, $event){
    if( this.movimientos_cancelados[i] == false){
      this.movimientos_cancelados[i] = true;
      this.valores[i]['movimiento'] = true;
      this.valores[i]['pies'] = true;
      this.valores[i]['shimmi'] = true;
      this.valores[i]['palomas'] = true;
      this.valores[i]['pordbra'] = true;
      this.valores[i]['craneo'] = true;
    
    }
    else{
      this.movimientos_cancelados[i] = false;
      this.valores[i]['movimiento'] = false;
      this.valores[i]['pies'] = false;
      this.valores[i]['shimmi'] = false;
      this.valores[i]['palomas'] = false;
      this.valores[i]['pordbra'] = false;
      this.valores[i]['craneo'] = false;      
    }
    this.calculaTotales(i);
  }
}
