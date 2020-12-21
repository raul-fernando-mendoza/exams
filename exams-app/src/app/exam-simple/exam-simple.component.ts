import {Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
export interface Row{
  id:string,
  label:string
}
export interface Col{
  id:string
}

export interface Row2{
  id:string,
  label:string,
  label2:string
}

/**
 * @title Stepper with editable steps
 */
@Component({
  selector: 'stepper-editable-example',
  templateUrl: 'exam-simple.component.html',
  styleUrls: ['exam-simple.component.css']
})
export class ExamSimpleComponent implements OnInit {

  isEditable = true;
  headers_1: Tile[] = [
    {text: 'saltado', cols: 1, rows: 3, color: '#DDBDF1'},
    {text: 'Posiciones', cols: 1, rows: 3, color: 'lightblue'},
    {text: 'Extremidades inferiores', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'Extremidades superiores', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'cabeza', cols: 1, rows: 2, color: 'lightblue'},
    {text: 'Valor', cols: 1, rows: 2, color: 'lightblue'},
    {text: 'Posiciones estáticas', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'manos', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'brazos', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'pies y piernas', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Shimmi (R,I,U)', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Palomas', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Port de bras', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Cráneo', cols: 1, rows: 1, color: 'lightgreen'},
    {text: '2.5', cols: 1, rows: 1, color: 'lightblue'},    
  ];

  exam = {
    total:0,
    exercises:{
      'exercise_1':{
        rowValue:0.5,
        rows:[
          {
            id:"primera",
            label:"1' (1 1/2)"
          },
          {
            id:"segunda",
            label:"2' (1 1/2)"
          },
          {
            id:"tercera",
            label:"3 (1 1/2)"
          },
          {
            id:"cuarta",
            label:"4' (1 1/2)"
          },
          {
            id:"quinta",
            label:"5' (1 1/2)"
          }
        ],
        columns:[
          { id:"pies" },
          { id:"shimmi"},
          { id:"palomas"},
          { id:"portdebras"},
          { id:"craneo"}
        ]
      },
      'exercise_2':{
        rowValue:1,
        rows:[
          {
            id:"segunda",
            label:"1' (1 1/2)",
            label2:"Fuera de la vertical",
            total:1 
          },
          {
            id:"primera",
            label:"2' (1 1/2)",
            label2:"Dentro de la vertical",
            total:1
          },
          {
            id:"cuarta",
            label:"3 (1 1/2)",
            label2:"Fuera y dentro de la vertical",
            total:1
          },
          {
            id:"fenix",
            label:"4' (1 1/2)",
            label2:"Fenix",
            total:1
          }
        ],
        columns:[  
          {id:"hombros"},
          {id:"menton"},
          {id:"movimiento"},
          {id:"espalda"},
          {id:"caderas"},
          {id:"pies"},
          {id:"shimmi"},
          {id:"brazos"},
          {id:"crotalos"}       
        ] 
      }
    }
  };

  reasonsPerRow = {
    "exercise_1":{
      "primera":{
        "pies":[
          { id:1, label: "rotar pie 30' hacia afuera" },
          { id:2, label: "apoyar sobre 1' o 2' metatarse"},
          { id:3, label: "tobillo hacia adentro"} ,
          { id:4, label: "talón hacia atrás"} ,
          { id:5, label: "caderas hacia enfrente"} 
        ],
        "shimmi":[
          { id:1, label: "Dar uniformidad" },
          { id:2, label: "Mantenerlo más tiempo" },
          { id:3, label: "comodidad al hacerlo" },
          { id:4, label: "ambas piernas" },
          { id:5, label: "no shake" }
        ],
        "palomas":[ //palomas
          { id:1, label: "dar suavidad" },
          { id:2, label: "alargar los dedos"},
          { id:3, label: "juntar los dedos"},
          { id:4, label: "pulgar en oposición"},
          { id:5, label: "mover las muñecas"}
        ],
        "portdebras":[ //port de bras
          { id:1, label: "dar suavidad"},
          { id:2, label: "dar fluidez"},
          { id:3, label: "cuidar ambos brazos"},
          { id:4, label: "omóplatos hacia abajo"},
          { id:5, label: "definir trayectoria y posición"}
        ],
        "craneo":[ //craneo
          { id:1, label: "barbilla a 90'"},
          { id:2, label: "cuello sin inclinación"}
        ]        
      },
      "segunda":{
        "pies":[
          { id:1, label: "Rotar pie 30' hacia afuera" },
          { id:2, label: "Apoyar sobre 1' o 2' metatarso"},
          { id:3, label: "tobillo hacia adentro (aduccion)"},  
          { id:3, label: "talon hacia atras"},
          { id:3, label: "caderas hacia enfrente"}
        ]
      },
      "tercera":{
        "pies":[ 
          { id:1, label: "pies en perpendicular" },
          { id:2, label: "apoyar sobre 1' o 2' metatarso"},
          { id:3, label: "tobillo hacia adentro (aducción)"},
          { id:4, label: "talón hacia atrás"},
          { id:5, label: "torso en torsión caderas en diagonal"}
        ]
      },
      "cuarta":{
        "pies":[
          { id:1, label: "rotar pie 30' hacia afuera" },
          { id:2, label: "apoyar sobre pulgar y 1' metatarso"},
          { id:3, label: "tobillo hacia abajo"},  
          { id:4, label: "talón hacia atrás"},
          { id:5, label: "caderas hacia enfrente"} 
        ]
      },
      "quinta":{ 
        "pies":[
          { id:1, label: "rotar pie 30' hacia afuera" },
          { id:2, label: "apoyar sobre pulgar y 1' metatarso"},
          { id:3, label: "tobillo hacia abajo"},  
          { id:4, label: "talón hacia atrás"},
          { id:5, label: "caderas hacia enfrente"} 
        ]
      }
    },
    "exercise_2":{
      "segunda":{
        "hombros":[
          { id:1, label: "cuello-hombro = ángulo 90°" },
          { id:2, label: "omóplatos hacia abajo y atrás"},
          { id:3, label: "presión descendente en los hombros"} ,
          { id:4, label: "estirar el cuello"} ,
          { id:5, label: "no mover los hombros"} 
        ],
        "menton":[
          { id:1, label: "cuello-mentón = ángulo 90°" },
          { id:2, label: "cuello sobre la vertical" },
          { id:3, label: "bajar el menton" }
        ],
        "movimiento":[ 
          { id:1, label: "Definir cada movimiento" },
          { id:2, label: "Aplitud"},
          { id:3, label: "Mantener la superficie de apoyo."}
        ],
        "espalda":[ 
          { id:1, label: "espalda recta"},
          { id:2, label: "mov sobre el plano horizontal"}
        ],
        "caderas":[ //craneo
          { id:1, label: "barbilla a 90'"},
          { id:2, label: "cuello sin inclinación"}
        ],
        "pies":[
          { id:1, label: "rotar pie 30° hacia afuera" },
          { id:2, label: "apoyar sobre pulgar y  1° metatarso"},
          { id:3, label: "tobillo hacia abajo"} ,
          { id:4, label: "alón hacia atrás"} ,
          { id:5, label: "caderas hacia enfrente"} 
        ],
    		"shimmi":[
          { id:1, label: "Dar uniformidad" },
          { id:2, label: "mantenerlo mas tiempo"},
          { id:3, label: "comodidad al hacerlo"} ,
          { id:4, label: "ambas piernas"} ,
          { id:5, label: "no shake"} 
        ],
        "brazos":[
          { id:1, label: "Precisión en brazos" },
          { id:2, label: "Manos en pronación"},
          { id:3, label: "Extender los dedos"} ,
          { id:4, label: "Juntar dedos en la lateral"} ,
          { id:5, label: "separar dedos en la vertical"} 
        ],
        "crotalos":[
          { id:1, label: "mantener crótalos separados" },
          { id:2, label: "fuera de tiempo"},
          { id:3, label: "a contratiempo"} ,
          { id:4, label: "afinar crótalos"} ,
          { id:5, label: "claridad en el sonido"} 
        ]		
      },
      "primera":{
        "movimiento":[
          { id:1, label: "Definir cada movimiento" },
          { id:2, label: "Altura"},
          { id:4, label: "Mantener la superficie de apoyo."}
        ],
		    "espalda":[
          { id:1, label: "espalda recta" },
          { id:2, label: "mov sobre el plano vertical"}
        ],
		    "pies":[
          { id:1, label: "rotar pie 30° hacia afuera" },
          { id:2, label: "apoyar sobre 1° o 2° metatarso"},
          { id:3, label: "tobillo hacia adentro (aducción)"} ,
          { id:4, label: "talón hacia atrás"} ,
          { id:5, label: "caderas hacia enfrente"} 
		    ]
      },
      "cuarta":{
        "movimiento":[ 
          { id:1, label: "Definir cada movimiento" },
          { id:2, label: "Altura"},
          { id:3, label: "Amplitud"},
          { id:4, label: "Mantener la superficie de apoyo"}
        ],
		    "espalda":[
          { id:1, label: "espalda recta" },
          { id:2, label: "mov sobre el plano vertical"},
		      { id:3, label: "mov sobre el plano horizontal"}
        ],
		    "pies":[
            { id:1, label: "rotar pie 30° hacia afuera" },
            { id:2, label: "apoyar sobre 1° o 2° metatarso"},
            { id:3, label: "tobillo hacia adentro (aducción)"} ,
            { id:4, label: "talón hacia atrás"} ,
            { id:5, label: "caderas hacia enfrente"} 
        ]
      },
      "fenix":{ 
        "movimiento":[
          { id:1, label: "Definir cada movimiento" },
          { id:2, label: "Volumen"},
          { id:3, label: "abdómen adentro"}
        ],
		    "espalda":[
          { id:1, label: "espalda recta" },
          { id:2, label: "mov en circunducción"}
        ],
		    "pies":[
            { id:1, label: "rotar pie 30° hacia afuera" },
            { id:2, label: "apoyar sobre pulgar y  1° metatarso"},
            { id:3, label: "tobillo hacia abajo "} ,
            { id:4, label: "talón hacia atrás"} ,
            { id:5, label: "caderas hacia enfrente"} 
		    ]
      }
    }
  };

  // ************** ejecicio 2 

  headers_2: Tile[] = [
    {text: 'saltado', cols: 1, rows: 2, color: '#DDBDF1'},
    {text: ' ', cols: 4, rows: 1, color: 'lightblue'},
    {text: 'Cuello', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'Tronco', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Extremidades Inferiores', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'Extremidades Superiores', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Complemento', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Valor', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Posicion', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'Torso', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'Hombros', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Mentón', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Movimiento', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Espalda', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Caderas', cols: 1, rows: 1, color: 'lightgreen'},    
    {text: 'Pies y Piernas', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Shimmi (R,I,U)', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Brazos y dedos', cols: 1, rows: 1, color: 'lightgreen'},
    {text: 'Crotalos a tiempo', cols: 1, rows: 1, color: 'lightgreen'},
    {text: '4.0', cols: 1, rows: 1, color: 'lightgreen'}
  ];

  

 
  valores_seleccionados = [];
  razones_seleccionadas = [];
  otras_razones_seleccionadas = [];
  movimientos_cancelados = [];
  
  constructor(private route: ActivatedRoute
    , public dialog: MatDialog
    ) {}

  ngOnInit() {
    
  }
  onSubmit(){
    alert("completado gracias!")
  }

  onChangeReason(exercise_id:string, row_id:string, col_id:string){
    if( !this.isCanceledRow(exercise_id, row_id) )
      this.openReasons(exercise_id, row_id, col_id);
  }
  isSelected(exercise_id:string, row_id:string, col_id:string){
    var result = false;
    if( this.valores_seleccionados[exercise_id] &&
        this.valores_seleccionados[exercise_id][row_id] &&
        this.valores_seleccionados[exercise_id][row_id][col_id])
        result = this.valores_seleccionados[exercise_id][row_id][col_id];    
    return result;
  }
  setSelected(exercise_id:string, row_id:string, col_id:string, value:boolean){
    if( !this.valores_seleccionados[exercise_id] )
      this.valores_seleccionados[exercise_id] = [];
    if( !this.valores_seleccionados[exercise_id][row_id] )
      this.valores_seleccionados[exercise_id][row_id] = [];
    this.valores_seleccionados[exercise_id][row_id][col_id]=value;
  }

  


  onCancel(){
    console.log("onCancel");
  }
  setReasonSelected(exercise_id:string, row_id:string, col_id:string, reason_id:string, value:boolean){
    if( !this.razones_seleccionadas[exercise_id] )
      this.razones_seleccionadas[exercise_id] =[]
    if( !this.razones_seleccionadas[exercise_id][row_id] )  
      this.razones_seleccionadas[exercise_id][row_id] = [];
    if( !this.razones_seleccionadas[exercise_id][row_id][col_id] )  
      this.razones_seleccionadas[exercise_id][row_id][col_id] = []; 
    this.razones_seleccionadas[exercise_id][row_id][col_id][reason_id] = value;     
  }

  isReasonSelected(exercise_id:string, row_id:string, col_id:string, reason_id:string){
    var reasonSelected = false;
    if( this.razones_seleccionadas[exercise_id] &&
      this.razones_seleccionadas[exercise_id][row_id] && 
      this.razones_seleccionadas[exercise_id][row_id] && 
      this.razones_seleccionadas[exercise_id][row_id][col_id] &&
      this.razones_seleccionadas[exercise_id][row_id][col_id][reason_id] ){
        
      reasonSelected = this.razones_seleccionadas[exercise_id][row_id][col_id][reason_id];
    }  
    return reasonSelected;
  }

  getOtherReasonsSelected(exercise_id:string, row_id:string, col_id:string){
    var otherReasonSelected = "";
    if( this.otras_razones_seleccionadas[exercise_id] && 
      this.otras_razones_seleccionadas[exercise_id][row_id] && 
      this.otras_razones_seleccionadas[exercise_id][row_id][col_id]){
      otherReasonSelected = this.otras_razones_seleccionadas[exercise_id][row_id][col_id];
    }
    return otherReasonSelected;
  }  
  setOtherReasonsSelected(exercise_id:string, row_id:string, col_id:string, value:string){
    var otherReasonSelected = "";
    if( !this.otras_razones_seleccionadas[exercise_id]) 
      this.otras_razones_seleccionadas[exercise_id] = []
      
    if( !this.otras_razones_seleccionadas[exercise_id][row_id])
      this.otras_razones_seleccionadas[exercise_id][row_id] = [] 

    if( !this.otras_razones_seleccionadas[exercise_id][row_id][col_id])
      this.otras_razones_seleccionadas[exercise_id][row_id][col_id] = []

    this.otras_razones_seleccionadas[exercise_id][row_id][col_id] = value;

  }  

  retriveReasons(exercise_id:string, row_id:string, col_id:string){
    var reasons = [];
    if( this.reasonsPerRow[exercise_id] &&
      this.reasonsPerRow[exercise_id][row_id] && 
      this.reasonsPerRow[exercise_id][row_id][col_id] ){
        
      reasons = this.reasonsPerRow[exercise_id][row_id][col_id];
    } 
    else{
      var exerciseRowsKeys = Object.keys(this.reasonsPerRow[exercise_id]);
      for (var key of exerciseRowsKeys){
        var rowObject = this.reasonsPerRow[exercise_id][key]
        reasons = rowObject[col_id];
        break;
      }
    } 
    return reasons;
  };


  openReasons( exercise_id:string, row_id:string, col_id:string){
    //alert("change:" + label + " " + column + " " + index + " " + checked);
    var par = {
      "questionsArr":[],
      "otra":""
    };
    var razones = this.retriveReasons(exercise_id, row_id, col_id);

    for(let i=0; i<razones.length; i++){
      let reasonSelected = this.isReasonSelected(exercise_id, row_id, col_id, razones[i].id);
      var n = {
        "id":razones[i].id,
        "label":razones[i].label,
        "isSelected": reasonSelected
      }
      par.questionsArr.push(n);
    }  
    par.otra = this.getOtherReasonsSelected(exercise_id, row_id, col_id);

    
    let dialogRef = this.dialog.open(ReasonSelectionComponent, {
      data: { questions:par },
      height: '400px',
      width: '600px',
      disableClose:false
    });    

    dialogRef.afterClosed().subscribe(result => {
      
      console.log("Dialog result: ${JSON.stringify(result)}"); 

      this.setSelected(exercise_id, row_id, col_id, !result.isClean)

      for( let i = 0; i< result.questionsArr.length; i++){

        this.setReasonSelected(exercise_id, row_id, col_id, razones[i].id , result.questionsArr[i].isSelected);     
      }

      this.setOtherReasonsSelected(exercise_id, row_id, col_id,result.otra)
      
    })
  
  };

  onCancelRow(exercise_id:string, row_id:string){
    console.log( "canceling row :"+ exercise_id + " id:" + row_id);
    if( !this.movimientos_cancelados[exercise_id] )
      this.movimientos_cancelados[exercise_id] = [];
    if( !this.razones_seleccionadas[exercise_id] )
      this.razones_seleccionadas[exercise_id] = [];

    if( this.movimientos_cancelados[exercise_id][row_id] ){
      this.movimientos_cancelados[exercise_id][row_id] = false;
      this.razones_seleccionadas[exercise_id][row_id] = [];
      for( let i=0; i < this.exam.exercises[exercise_id].columns.length; i++){
        var c =  this.exam.exercises[exercise_id].columns[i];
        this.setSelected(exercise_id, row_id, c.id , false);
      }  
    }
    else{
      this.movimientos_cancelados[exercise_id][row_id] = true;
      this.razones_seleccionadas[exercise_id][row_id] = [];
      for( let i=0; i < this.exam.exercises[exercise_id].columns.length; i++){
        var c =  this.exam.exercises[exercise_id].columns[i];
        this.setSelected(exercise_id, row_id, c.id , true);
      }  
    }   
    
    this.calculaTotales(exercise_id, row_id);    
    return false;
    
  }
  isCanceledRow(exercise_id:string, row_id:string){
    if( this.movimientos_cancelados[exercise_id] &&
        this.movimientos_cancelados[exercise_id][row_id] )
        return true;
    return false;
  } 
  calculaTotales(exercise_id:string, row_id:string){
    var result:number = this.exam.exercises[exercise_id].rowValue;
    
    for( let i=0; i < this.exam.exercises[exercise_id].columns.length; i++){
      var c =  this.exam.exercises[exercise_id].columns[i];
      if( this.isSelected(exercise_id, row_id, c.id ) )
        result = result - this.exam.exercises[exercise_id].rowValue/this.exam.exercises[exercise_id].columns.length ;

      this.exam.exercises[exercise_id].rows[row_id].total = result;
    }  

    var sum:number = 0.0;
    var exerciseKeys = Object.keys(this.exam.exercises);
    for (var key of exerciseKeys)
      sum = sum + this.reasonsPerRow[key].total
    
    this.exam.total = sum    
  }  
  getTotalByRow(exercise_id:string, row_id:string){
    let rowValue = this.exam.exercises[exercise_id].rowValue;
    let numCols = this.exam.exercises[exercise_id].columns.length
    var result = rowValue;
    for(let i=0; i<numCols; i++ ){
      var c = this.exam.exercises[exercise_id].columns[i];
      if( this.isSelected(exercise_id, row_id, c.id) )
        result = result - rowValue/ numCols;

    }
    return result;
  }
  getTotalByExercise(exercise_id:string){
    let rowsNumber = this.exam.exercises[exercise_id].rows.length;
    let result = 0.0;
    for( let i=0; i< rowsNumber; i++){
      let r = this.exam.exercises[exercise_id].rows[i];
      result += this.getTotalByRow(exercise_id,r.id);
    }
    return result;
  }  
}
