import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog'; 
import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';
//import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';


interface IHeader{
  groups: Array<{
    id:number,
    label:string,
    columns:Array<
      {
        id:number,
        label:string
      }
    >
  }>
}

interface IRows{
  
  rows:Array<{
    id:number,
    columns:Array<{
      id:number, 
      label:string 
    }>
  }>
}

interface IReasonsPerRow{
  row_id:number,
  group_id:number,
  column_id:number,
  reasons:Array<{
    id:number,
    label:string
  }>
}

@Component({
  selector: 'app-exam-application',
  templateUrl: './exam-application.component.html',
  styleUrls: ['./exam-application.component.css']
})
export class ExamApplicationComponent {
 
  headersStatic:IHeader;
  headersDynamic:IHeader;

  rowsStatic:IRows;

  reasonsPerRow:IReasonsPerRow[] = [];

  razones_seleccionadas = []; //valores[movimiento][columna][i] : question
  movimientos_cancelados = [];
  valores_seleccionados = []; //valores[movimiento][columna]:boolean
  
  otras_razones_seleccionadas = []; //valores[movimiento][columna]:string
  totales = [0];
  granTotal = 0.0;

  movimiento_value = 0;

  currentStep=1;
  totalSteps=2
  
 
  
  


  
  initializeFormControls(step:number){
    if(step == 1){
      this.currentStep = 1;
      console.log("iniciando headers staticos");

      this.headersStatic = {
        groups:[
          { 
            id:1,
            label:null,
            columns:[
              {
                id:1, 
                label:"posiciones"
              }
            ]
          }
        ]
      };
      
      this.headersDynamic = {
        groups:[
          {
            id:1,
            label:"Extremidades superiores",
            columns:[
              {
                id:1, label:"manos:Palomas"
              },
              {
                id:1, label:"brazos:Port de bras"
              },
            ]
          },
          {
            id:2,
            label:"cabeza",
            columns:[
              { id:1, label:"Cráneo"}
            ]
          }          
        ]
      }

      console.log("inicializando renglones estaticos")
      this.rowsStatic = {
        rows:[
          {
            id:1,
            columns:[
              {
                id:1,
                label:"1' (1 1/2)"
              }
            ]
          },    
          {
            id:2,
            columns:[
              {
                id:1,
                label:"2' (1 1/2)"
              }
            ]
          },    
          {
            id:2,
            columns:[
              {
                id:1,
                label:"3 (1 1/2)"
              }
            ]
          },    
          {
            id:3,
            columns:[
              {
                id:1,
                label:"4' (1 1/2)"
              }
            ]
          },    
          {
            id:4,
            columns:[
              {
                id:1,
                label:"5' (1 1/2)"
              }
            ]
          },
        ]
      };

      console.log("inicializando razones por movimientos")
      this.reasonsPerRow=[

        { row_id:1, group_id:1, column_id:1, reasons:[
            { id:1, label: "rotar pie 30' hacia afuera" },
            { id:2, label: "apoyar sobre 1' o 2' metatarse"},
            { id:3, label: "tobillo hacia adentro"} ,
            { id:4, label: "talón hacia atrás"} ,
            { id:5, label: "caderas hacia enfrente"} 
          ]
        },
        {  row_id:2, group_id:1, column_id:1,reasons:[
            { id:1, label: "Rotar pie 30' hacia afuera" },
            { id:2, label: "Apoyar sobre 1' o 2' metatarso"},
            { id:3, label: "tobillo hacia adentro (aduccion)"},  
            { id:3, label: "talon hacia atras"},
            { id:3, label: "caderas hacia enfrente"}
          ]
        },
        { row_id:3, group_id:1, column_id:1, reasons:[ 
            { id:1, label: "pies en perpendicular" },
            { id:2, label: "apoyar sobre 1' o 2' metatarso"},
            { id:3, label: "tobillo hacia adentro (aducción)"},
            { id:4, label: "talón hacia atrás"},
            { id:5, label: "torso en torsión caderas en diagonal"}
          ]
        },
        { row_id:4, group_id:1, column_id:1,  reasons:[ 
            { id:1, label: "Rotar pie 30' hacia afuera" },
            { id:2, label: "apoyar sobre 1' o 2' metatarso"},
            { id:3, label: "tobillo hacia adentro (aducción)"},  
            { id:3, label: "talón hacia atrás"},
          ]
        },
        { row_id:5, group_id:1, column_id:1,  reasons:[ 
            { id:1, label: "rotar pie 30' hacia afuera" },
            { id:2, label: "apoyar sobre pulgar y 1' metatarso"},
            { id:3, label: "tobillo hacia abajo"},  
            { id:4, label: "talón hacia atrás"},
            { id:5, label: "caderas hacia enfrente"} 
          ]
        },
        { row_id:1, group_id:1, column_id:1,  reasons:[ 
            { id:1, label: "rotar pie 30' hacia afuera" },
            { id:2, label: "apoyar sobre pulgar y 1' metatarso"},
            { id:3, label: "tobillo hacia abajo"},  
            { id:4, label: "talón hacia atrás"},
            { id:5, label: "caderas hacia enfrente"} 
          ]
        },

        { row_id:1, group_id:1, column_id:2,  reasons:[  //shimmi
            { id:1, label: "Dar uniformidad" },
            { id:2, label: "Mantenerlo más tiempo" },
            { id:3, label: "comodidad al hacerlo" },
            { id:4, label: "ambas piernas" },
            { id:5, label: "no shake" }
          ]
        }, 
        { row_id:1, group_id:1, column_id:2,  reasons:[  //shimmi
            { id:1, label: "Dar uniformidad" },
            { id:2, label: "Mantenerlo más tiempo" },
            { id:3, label: "comodidad al hacerlo" },
            { id:4, label: "ambas piernas" },
            { id:5, label: "no shake" }
          ]
        },
        { row_id:1, group_id:2, column_id:1,  reasons:[ //palomas
            { id:1, label: "dar suavidad" },
            { id:2, label: "alargar los dedos"},
            { id:3, label: "juntar los dedos"},
            { id:4, label: "pulgar en oposición"},
            { id:5, label: "mover las muñecas"}
          ]
        },
        { row_id:1, group_id:2, column_id:2,  reasons:[ //port de bras
            { id:1, label: "dar suavidad"},
            { id:2, label: "dar fluidez"},
            { id:3, label: "cuidar ambos brazos"},
            { id:4, label: "omóplatos hacia abajo"},
            { id:5, label: "definir trayectoria y posición"}
          ]
        },
        { row_id:1, group_id:3, column_id:1,  reasons:[ //craneo
            { id:1, label: "barbilla a 90'"},
            { id:2, label: "cuello sin inclinación"}
          ]
        }
      ];

      this.movimiento_value = 0.5;
    }    
    if(step == 2){
      this.currentStep = 1;
      console.log("StEP2 iniciando headers staticos");

      this.headersStatic = {
        groups:[
          { 
            id:1,
            label:null,
            columns:[
              {
                id:1, 
                label:"StEP2 posiciones"
              }
            ]
          },
          { 
            id:2,
            label:"STEP2",
            columns:[
              {
                id:1, 
                label:"StEP2 segunda"
              }
            ]
          }          
        ]
      };
      
      this.headersDynamic = {
        groups:[
          {
            id:1,
            label:"StEP2 Extremidades superiores",
            columns:[
              {
                id:1, label:"StEP2manos:Palomas"
              },
              {
                id:1, label:"StEP2brazos:Port de bras"
              },
            ]
          },
          {
            id:2,
            label:"StEP2cabeza",
            columns:[
              { id:1, label:"StEP2Cráneo"}
            ]
          }          
        ]
      }

      console.log("STEP2 inicializando renglones estaticos")
      this.rowsStatic = {
        rows:[
          {
            id:1,
            columns:[
              {
                id:1,
                label:"1' (1 1/2)"
              },
              {
                id:1,
                label:"step2 row"
              }              
            ]
          },    
          {
            id:2,
            columns:[
              {
                id:1,
                label:"2' (1 1/2)"
              },
              {
                id:1,
                label:"step2 row2"
              } 
            ]
          },    
          {
            id:3,
            columns:[
              {
                id:1,
                label:"3 (1 1/2)"
              },
              {
                id:1,
                label:"step2 3"
              } 
            ]
          },    
          {
            id:4,
            columns:[
              {
                id:1,
                label:"4' (1 1/2)"
              },
              {
                id:2,
                label:"step2 row4"
              } 
            ]
          }
        ]
      };

      console.log("inicializando razones por movimientos")
      this.reasonsPerRow=[

        { row_id:1, group_id:1, column_id:1, reasons:[
            { id:1, label: "STEP2 rotar pie 30' hacia afuera" },
            { id:2, label: "STEP2 apoyar sobre 1' o 2' metatarse"},
            { id:3, label: "STEP2 tobillo hacia adentro"} ,
            { id:4, label: "STEP2 talón hacia atrás"} 
          ]
        },
        {  row_id:2, group_id:1, column_id:2,reasons:[
            { id:1, label: "STEP2 Rotar pie 30' hacia afuera" },
            { id:2, label: "STEP2 Apoyar sobre 1' o 2' metatarso"},
            { id:3, label: "STEP2 tobillo hacia adentro (aduccion)"},  
            { id:3, label: "STEP2 talon hacia atras"},
            { id:3, label: "STEP2caderas hacia enfrente"}
          ]
        },
        { row_id:3, group_id:1, column_id:1, reasons:[ 
            { id:1, label: "STEP2 pies en perpendicular" },
            { id:2, label: "STEP2 apoyar sobre 1' o 2' metatarso"},

          ]
        },
        { row_id:4, group_id:1, column_id:1,  reasons:[ 
            { id:1, label: "STEP2 Rotar pie 30' hacia afuera" },
            { id:2, label: "STEP2 apoyar sobre 1' o 2' metatarso"},
            { id:3, label: "STEP2 tobillo hacia adentro (aducción)"},  
            { id:3, label: "STEP2 talón hacia atrás"},
          ]
        },
        { row_id:5, group_id:1, column_id:1,  reasons:[ 
            { id:1, label: "STEP2 rotar pie 30' hacia afuera" },
            { id:2, label: "STEP2 apoyar sobre pulgar y 1' metatarso"},
            { id:3, label: "STEP2tobillo hacia abajo"}
          ]
        },
        { row_id:1, group_id:1, column_id:1,  reasons:[ 
            { id:1, label: "STEP2 rotar pie 30' hacia afuera" },
            { id:2, label: "STEP2 apoyar sobre pulgar y 1' metatarso"}
          ]
        },

        { row_id:1, group_id:1, column_id:2,  reasons:[  //shimmi
            { id:1, label: "STEP2 Dar uniformidad" }
          ]
        }, 
        { row_id:1, group_id:1, column_id:2,  reasons:[  //shimmi
            { id:1, label: "STEP2 Dar uniformidad" },
            { id:2, label: "STEP2 Mantenerlo más tiempo" }
          ]
        },
        { row_id:1, group_id:2, column_id:1,  reasons:[ //palomas
            { id:1, label: "STEP2 dar suavidad" },
            { id:2, label: "STEP2alargar los dedos"},
            { id:3, label: "STEP2juntar los dedos"},
            { id:4, label: "STEP2pulgar en oposición"},
            { id:5, label: "STEP2 mover las muñecas"}
          ]
        },
        { row_id:1, group_id:2, column_id:2,  reasons:[ //port de bras
            { id:1, label: "row_id:1, group_id:2, column_id:2 dar suavidad"},
            { id:2, label: "row_id:1, group_id:2, column_id:2 dar fluidez"},
            { id:3, label: "row_id:1, group_id:2, column_id:2 cuidar ambos brazos"},
            { id:4, label: "row_id:1, group_id:2, column_id:2 omóplatos hacia abajo"},
            { id:5, label: "row_id:1, group_id:2, column_id:2 definir trayectoria y posición"}
          ]
        },
        { row_id:1, group_id:3, column_id:1,  reasons:[ //craneo
            { id:1, label: "row_id:1, group_id:3, column_id:1, barbilla a 90'"},
            { id:2, label: "row_id:1, group_id:3, column_id:1,cuello sin inclinación"}
          ]
        }
      ];

      
      
    }   
    this.movimiento_value = 1; 

    //initializando valores
    console.log("inicializando valores")
    this.movimientos_cancelados = new Array(this.rowsStatic.rows.length).fill(false);
    this.totales = new Array(this.rowsStatic.rows.length).fill(this.movimiento_value);
    //this.granTotal = this.rowsStatic[0].length * this.movimiento_value;
    
    this.valores_seleccionados = [];
    this.razones_seleccionadas = [];
    this.otras_razones_seleccionadas = [];

  } 
  exam_id: number;
  constructor(private route: ActivatedRoute
    , public dialog: MatDialog
    ) {}

  ngOnInit() {
    this.exam_id = Number(this.route.snapshot.paramMap.get('exam_id'));
    this.initializeFormControls(1);
    //alert( "receive:" + this.exam_id)
  }

  onSubmit() {
    alert('Thanks!');
  }

  retriveReasons(row_id:number, group_id:number, column_id:number){
    for( let i:number; i< this.reasonsPerRow.length; i++){
      if( this.reasonsPerRow[i].row_id === row_id &&
          this.reasonsPerRow[i].group_id === group_id &&
          this.reasonsPerRow[i].column_id == column_id){
            return this.reasonsPerRow[i].reasons;
      }
    }
    for( let i:number; i< this.reasonsPerRow.length; i++){
      if( this.reasonsPerRow[i].row_id === this.rowsStatic[0].id &&
          this.reasonsPerRow[i].group_id === this.headersStatic.groups[0].id &&
          this.reasonsPerRow[i].column_id == column_id){
            return this.reasonsPerRow[i].reasons;
      }
    }    
    return null;
  };
  
  openReasons( row_id:number, group_id:number, col_id:number){
    //alert("change:" + label + " " + column + " " + index + " " + checked);
    var par = {
      "questionsArr":[],
      "otra":""
    };
    var razones = this.retriveReasons(row_id, group_id, col_id);

    for(let i=0; i<razones.length; i++){
      let reasonSelected = false;
      if( this.razones_seleccionadas[row_id] && 
        this.razones_seleccionadas[row_id][group_id] && 
        this.razones_seleccionadas[row_id][group_id][col_id] &&
        this.razones_seleccionadas[row_id][group_id][col_id][razones[i].id] ){
          
        reasonSelected = this.razones_seleccionadas[row_id][group_id][col_id][razones[i].id];
      }      
      var n = {
        "id":razones[i].id,
        "label":razones[i].label,
        "isSelected": reasonSelected
      }
      par.questionsArr.push(n);
    }  

    let otherReasonSelected = "";
    if( this.otras_razones_seleccionadas[row_id] && 
        this.otras_razones_seleccionadas[row_id][group_id] && 
        this.otras_razones_seleccionadas[row_id][group_id][col_id]){
      otherReasonSelected = this.otras_razones_seleccionadas[row_id][group_id][col_id];
    }

    par.otra = otherReasonSelected;

    
    let dialogRef = this.dialog.open(ReasonSelectionComponent, {
      data: { questions:par },
      height: '400px',
      width: '600px',
      disableClose:false
    });    

    dialogRef.afterClosed().subscribe(result => {
      
      console.log("Dialog result: ${JSON.stringify(result)}"); 
      if( !this.valores_seleccionados[row_id] )
        this.valores_seleccionados[row_id] = [];

      this.valores_seleccionados[row_id][col_id]=!result.isClean;

      for( let i = 0; i< result.questionsArr; i++){
        if( !this.razones_seleccionadas[row_id] )  
          this.razones_seleccionadas[row_id] = [];
        if( !this.razones_seleccionadas[row_id][group_id] )  
          this.razones_seleccionadas[row_id][group_id] = []; 
        if( !this.razones_seleccionadas[row_id][group_id][col_id] )  
          this.razones_seleccionadas[row_id][group_id][col_id] = []; 

        this.razones_seleccionadas[row_id][group_id][col_id][razones[i].id]  =  result.questionsArr[i].isSelected;     
      }

      if( !this.otras_razones_seleccionadas[row_id] ) 
        this.otras_razones_seleccionadas[row_id] = [];
      if( !this.otras_razones_seleccionadas[row_id][group_id] )
        this.otras_razones_seleccionadas[row_id] = [];
      if( !this.otras_razones_seleccionadas[row_id][group_id][col_id]) 
        this.otras_razones_seleccionadas[row_id][group_id][col_id] = [];
        
      this.otras_razones_seleccionadas[row_id][group_id][col_id] = result.otra;
      
    })
  
  };

  calculaTotales(row_id){
    var result:number = this.movimiento_value;
    
    for( let g=0; g< this.headersStatic.groups.length; g++){
      for( let col= 0; col <  this.headersStatic.groups[g].columns.length; col++){
        if( this.getIsSelectedFor(row_id, this.headersStatic.groups[g].id, this.headersStatic.groups[g].columns[col].id ) )
          result = result - (this.movimiento_value / this.headersStatic.groups[g].columns.length);
      }     
    }

    this.totales[row_id] = result;

    var sum:number = 0.0;
    for( let i=0; i<this.totales.length; i++){
      sum = sum + this.totales[i];
    }
    this.granTotal = sum    
  }


  onChangeReason(row_id:number, group_id, col_id:number){
    if( this.movimientos_cancelados[row_id] == false){
      this.openReasons( row_id, group_id, col_id)
    }
  }
  getIsSelectedFor(row_id:number, group_id:number, col_id:number){
    if( this.valores_seleccionados[row_id] &&
        this.valores_seleccionados[row_id][group_id] &&
         this.valores_seleccionados[row_id][group_id][col_id])
      return this.valores_seleccionados[row_id][col_id][col_id];
    return false;
  }
  onCancelRow(row_id:number){

    if( this.movimientos_cancelados[row_id] == false){
      this.movimientos_cancelados[row_id] = true;
      this.valores_seleccionados[row_id] = [];
      this.razones_seleccionadas[row_id] = [];
      for( let g=0; g< this.headersStatic.groups.length; g++){
        for( let col= 0; col <  this.headersStatic.groups[g].columns.length; col++){
          this.valores_seleccionados[row_id][g][col] = true;
        }     
      }
    }
    else{
      this.movimientos_cancelados[row_id] = false;
      this.valores_seleccionados[row_id] = [];
      this.razones_seleccionadas[row_id] = [];
      for( let g=0; g< this.headersStatic.groups.length; g++){
        for( let col= 0; col <  this.headersStatic.groups[g].columns.length; col++){
          this.valores_seleccionados[row_id][g][col] = false;
        }     
      }
    }
    this.calculaTotales(row_id);
  }
  onCancel(){
    alert("canceled");
  }
  onNext(){
    if( this.currentStep < this.totalSteps)
      this.initializeFormControls(this.currentStep + 1);
  }
  onPrevious(){
    if( this.currentStep > 1)
      this.initializeFormControls(this.currentStep - 1);
  }

}
