import {Component, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReasonSelectionComponent } from '../reason-selection/reason-selection.component';
import { ExamService } from '../exam-service';



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
  submitting = false;
  version = 0.4;

  exam = {
    total:0,
    exercises:{
      'exercise_1':{
        
        rows:[
          {
            id:"primera",
            label:"1'",
            rowValue:0.6
          },
          {
            id:"segunda",
            label:"2'",
            rowValue:0.6
          },
          {
            id:"tercera",
            label:"3'",
            rowValue:0.6
          },
          {
            id:"cuarta",
            label:"4'",
            rowValue:0.6
          },
          {
            id:"quinta",
            label:"5'",
            rowValue:0.6
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
            label:"2'",
            label2:"Fuera del eje",
            rowValue:1
          },
          {
            id:"primera",
            label:"1'",
            label2:"Dentro del eje",
            rowValue:1
          },
          {
            id:"cuarta",
            label:"4'",
            label2:"Combinado",
            rowValue:1
          },
          {
            id:"fenix",
            label:"2'",
            label2:"Fenix",
            rowValue:1
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
      },
      'exercise_3':{
        
        rows:[
          {
            id:"caderas",
            label:"Balance",
            rowValue:1,
          },
          {
            id:"twist",
            label:"Twist",
            rowValue:1,
          },
          {
            id:"ocho_adelante",
            label:"8 ext",
            rowValue:1,
          },
          {
            id:"ocho_atras",
            label:"8 int",
            rowValue:1,
          },
          {
            id:"caderas_arriba_abajo",
            label:"Caderas incl",
            rowValue:1,
          },
          {
            id:"recogida",
            label:"Recogida",
            rowValue:1,
          },
          {
            id:"maya",
            label:"Maya",
            rowValue:1,
          },
          {
            id:"africana",
            label:"Africana",
            rowValue:1,
          },
          {
            id:"circulo_pequeno",
            label:"Circulo Peq",
            rowValue:1,
          },
          {
            id:"circulo_grande_d",
            label:"Circulo gde D",
            rowValue:0.5,
          },
          {
            id:"circulo_grande_i",
            label:"Circulo gde I",
            rowValue:0.5,
          },
          {
            id:"camello_reverse_d",
            label:"Camello-rev D",
            rowValue:0.5,
          },
          {
            id:"camello_reverse_i",
            label:"Camello-rev I",
            rowValue:0.5,
          }
        ],
        columns:[  
          {id:"caracteristicas"},
          {id:"shimmy"},
          {id:"manos"},
          {id:"port_de_bras"},
          {id:"crotalos"}   
        ] 
      },
      'exercise_4':{
        rowValue:1,
        rows:[
          {
            id:"caderas",
            label:"Balance",
            rowValue:1
          },
          {
            id:"twist",
            label:"Twist",
            rowValue:1
          },
          {
            id:"ocho_adelante",
            label:"8 ext",
            rowValue:1
          },
          {
            id:"ocho_atras",
            label:"8 int",
            rowValue:1
          },
          {
            id:"caderas_arriba_abajo",
            label:"Caderas incl",
            rowValue:1
          },
          {
            id:"recogida",
            label:"Recogida",
            rowValue:1
          },
          {
            id:"maya",
            label:"Maya",
            rowValue:1
          },
          {
            id:"torso",
            label:"Torso",
            rowValue:1
          },
          {
            id:"africana",
            label:"Africana",
            rowValue:1
          },
          {
            id:"circulo_pequeno",
            label:"Circulo Peq",
            rowValue:1
          },
          {
            id:"circulo_grande",
            label:"Circulo gde D",
            rowValue:1
          },
          {
            id:"camello_torso",
            label:"Camello Torso",
            rowValue:1
          },
          {
            id:"camello_pelvis",
            label:"Camello Pelvis",
            rowValue:1
          },
          {
            id:"reverse_pelvis",
            label:"Reverse Pelvis",
            rowValue:1
          }
        ],
        columns:[  
          {id:"caracteristica"},
          {id:"shimmy"},
          {id:"direccion"},
          {id:"ademanes"},
          {id:"nivel"},
          {id:"tiempo"},
          {id:"gesto"},
          {id:"portdebras"},
          {id:"arreglo"}     
        ] 
      },
      'exercise_5':{
        rowValue:1,
        rows:[
          {
            id:"primera",
            label:"I",
            rowValue:2
          },
          {
            id:"segunda",
            label:"II",
            rowValue:2
          },
          {
            id:"tercera",
            label:"III",
            rowValue:2
          },
          {
            id:"cuarta",
            label:"IV",
            rowValue:2
          }
        ],
        columns:[  
          {id:"crotalos"},
          {id:"arreglo"},
          {id:"gesto"},
          {id:"port_de_bras"},
          {id:"shimmy"},
          {id:"secuencia"},
          {id:"fluidez"},
          {id:"transiciones"}
        ] 
      }

    }
  };

  disabledQuestions = {
    "exercise_5":{
      "primera":{
        "arreglo":{
          disabled: true
        }        
      }, 
      "segunda":{
        "crotalos":{
          disabled: true
        },
        "arreglo":{
          disabled: true
        }        
      }, 
      "tercera":{
        "crotalos":{
          disabled: true
        },
        "arreglo":{
          disabled: true
        }        
      }
      , 
      "cuarta":{
        "crotalos":{
          disabled: true
        }       
      }           
    }
  };

  reasonsPerRow = {
    "exercise_1":{
      "primera":{
        "pies":[
          { id:1, label: "rotar pie 30' hacia afuera" },
          { id:2, label: "apoyar sobre 1' o 2' metatarso"},
          { id:3, label: "tobillo hacia adentro"} ,
          { id:4, label: "talón hacia atrás"} ,
          { id:5, label: "pelvis alineada"} 
        ],
        "shimmi":[
          { id:1, label: "uniformidad" },
          { id:2, label: "resistencia" },
          { id:3, label: "aspecto cómodo" },
          { id:4, label: "piernas alternadas" },
          { id:5, label: "piernas extendidas" }
        ],
        "palomas":[ //palomas
          { id:1, label: "dedos extendidos"},
          { id:2, label: "leve separación en dedos"},
          { id:3, label: "pulgar en anteposición"}
        ],
        "portdebras":[ //port de bras
          { id:1, label: "dar suavidad"},
          { id:2, label: "dar fluidez"},
          { id:3, label: "cuidar ambos brazos"},
          { id:4, label: "omóplatos hacia abajo"},
          { id:5, label: "definir trayectoria y posición"}
        ],
        "craneo":[ //craneo
          { id:1, label: "mentón recto"},
          { id:2, label: "cuello alineado"}
        ]        
      },
      "segunda":{
        "pies":[
          { id:1, label: "Rotar pie 30' hacia afuera" },
          { id:2, label: "Apoyar sobre 1' o 2' metatarso"},
          { id:3, label: "tobillo hacia adentro (aduccion)"},  
          { id:3, label: "talón hacia atras"},
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
          { id:1, label: "omóplatos hacia abajo y atrás"},
          { id:2, label: "presión descendente en los hombros"} ,
          { id:3, label: "elongar el cuello"} ,
          { id:4, label: "no mover los hombros"} 
        ],
        "menton":[
          { id:1, label: "cuello-mentón = ángulo 90°" },
          { id:2, label: "cuello sobre la vertical" },
          { id:3, label: "bajar el menton" }
        ],
        "movimiento":[ 
          { id:1, label: "Definicion" },
          { id:2, label: "Aplitud"},
          { id:3, label: "Disociación"}
        ],
        "espalda":[ 
          { id:1, label: "espalda recta"},
          { id:2, label: "mov sobre el plano horizontal"}
        ],
        "caderas":[ 
          { id:1, label: "Estatica"},
          { id:2, label: "Frontal"},
          { id:3, label: "Sobre la vertical"}
        ],
        "pies":[
          { id:1, label: "rotar pie 30° hacia afuera" },
          { id:2, label: "apoyar sobre pulgar y  1° metatarso"},
          { id:3, label: "tobillo hacia abajo"} ,
          { id:4, label: "talón hacia atrás"} 
        ],
        "shimmi":[
          { id:1, label: "uniformidad" },
          { id:2, label: "resistencia" },
          { id:3, label: "aspecto cómodo" },
          { id:4, label: "piernas alternadas" },
          { id:5, label: "piernas extendidas" }
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
          { id:3, label: "a contratiempo"},
          { id:4, label: "claridad en el sonido"} 
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
    },
    "exercise_3":{
      "caderas":{
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "desconectar caderas y torso"} ,
          { id:4, label: "traslaciones laterales de la pelvis"} ,
          { id:5, label: "alejamiento máx. de pelvis"} 
        ],
        "shimmy":[
          { id:1, label: "Dar uniformidad" },
          { id:2, label: "mantenerlo mas tiempo" },
          { id:3, label: "comodidad al hacerlo." },
          { id:4, label: "ambas piernas" },
          { id:5, label: "extender piernas" }
        ],
        "manos":[ 
          { id:1, label: "prolongar línea del brazo" },
          { id:2, label: "dedos proximales bajando el medio "},
          { id:3, label: "pulgar en oposición"},
          { id:4, label: "dedo indice y pulgar separados"},
          { id:5, label: "muñecas en línea media"}
        ],
        "port_de_bras":[ 
          { id:1, label: "pronación antebrazo (palmas abajo)"},
          { id:2, label: "dar fluidez"},
          { id:3, label: "vigilar ambos brazos "},
          { id:4, label: "omóplatos hacia abajo "},
          { id:5, label: "definir trayectoria y posición."}
        ],
        "crotalos":[ //craneo
          { id:1, label: "sonido a contratiempo"},
          { id:2, label: "sonido corto y fuerte"},
          { id:2, label: "sonido claro y agradable"}
        ]	
      },
      "twist":{
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "rotación eje vertical"},
          { id:4, label: "rotación interna y externa"}
        ]
      },
      "ocho_adelante":{
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "rotación interna/externa + traslación lateral"},
          { id:4, label: "torsión maxima de pelvis"},
          { id:4, label: "alejamiento máx. de pelvis"}
        ]
      },
      "ocho_atras":{
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "rotación interna/externa + traslación lateral"},
          { id:4, label: "torsión maxima de pelvis"},
          { id:5, label: "alejamiento máx. de pelvis"}
        ]
      },
      "caderas_arriba_abajo":{
        "caracteristicas":[
          { id:1, label: "alternar pies en uno y 1/2" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "inclinacion arriba/abajo + traslación lateral"}
        ]
      },
      "recogida":{
        "caracteristicas":[
          { id:1, label: "alternar pies en uno y 1/2" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "inclinacion arriba/abajo"}
        ]
      },
      "maya":{
        "caracteristicas":[
          { id:1, label: "alternar pies en uno y 1/2" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "inclinación arriba/abajo + traslación lateral"}
        ]
      },
      "africana":{ 
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "inclinación abajo + retroversión+inclinación abajo+posicion neutra."}
        ]
      },
      "circulo_pequeno":{ 
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "posición neutra + traslación lateral+inclinación posterior+ traslación lateral "},
          { id:4, label: "piernas en extención"},
          { id:5, label: "alejamiento máx. de pelvis"}
        ]
      },
      "circulo_grande_d":{ 
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "posición neutra + traslación lateral+inclinación posterior+ traslación lateral+inclinación anterior"},
          { id:3, label: "piernas flexionadas"},
          { id:4, label: "alejamiento máx. de pelvis"}
        ]
      },
      "circulo_grande_i":{ 
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "posición neutra + traslación lateral+inclinación posterior+ traslación lateral+inclinación anterior"},
          { id:3, label: "piernas flexionadas"},
          { id:4, label: "alejamiento máx. de pelvis"}
        ]
      },
      "camello_reverse_d":{ 
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "Torso: translación adelante y arriba, traslación atras y abajo"},
          { id:3, label: "Pelvis: traslación adelante+retroversión+traslación dorsal+anteroversión+posición inicial"},
          { id:4, label: "piernas en extensión"},
          { id:5, label: "alejamiento máx. de pelvis"}
        ]
      },
      "camello_reverse_i":{ 
        "caracteristicas":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "Torso: translación adelante y arriba, traslación atras y abajo"},
          { id:3, label: "Pelvis: traslación adelante+retroversión+traslación dorsal+anteroversión+posición inicial"},
          { id:4, label: "piernas en extensión"},
          { id:4, label: "alejamiento máx. de pelvis"}
        ]
      }
    },
    "exercise_4":{
      "caderas":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "desconectar caderas y torso"} ,
          { id:4, label: "traslaciones laterales de la pelvis"} ,
          { id:5, label: "alejamiento máx. de pelvis"} 
        ],
        "shimmy":[
          { id:1, label: "Dar uniformidad" },
          { id:2, label: "Mantenerlo más tiempo" },
          { id:3, label: "comodidad al hacerlo" },
          { id:4, label: "ambas piernas" },
          { id:5, label: "extender piernas" }
        ],
        "direccion":[ 
          { id:1, label: "Dir 6-4" },
          { id:2, label: "Dir 4-8"},
          { id:3, label: "Dir 8-6"},
          { id:4, label: "Dir 6-2"}
        ],
        "ademanes":[ 
          { id:1, label: "Inicial: Brazo extendido hacia arriba en supinación, dedos distales"},
          { id:2, label: "Brazos extendidos frontal, manos juntas, dedos distales"},
          { id:3, label: "Brazo flexionado, mano sobre la nariz. El otro brazo en la cadera"},
          { id:4, label: "Brazo flexionado cubriendo la boca: El otro brazo flexionado sobre el pecho"},
          { id:5, label: "Final: Brazos en 5a posición, dedos distales"}
        ],
        "nivel":[ 
          { id:1, label: "planta"},
          { id:2, label: "releve"},
          { id:3, label: "releve flotado"}
        ],
        "tiempo":[ 
          { id:1, label: "a dos tiempos"},
          { id:2, label: "a tiempo"},
          { id:3, label: "contínuo"}
        ],
        "gesto":[ 
          { id:1, label: "Alegría"},
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ],
        "portdebras":[ 
          { id:1, label: "pronación antebrazo (palmas abajo)"},
          { id:2, label: "dar fluidez"},
          { id:3, label: "vigilar ambos brazos"},
          { id:4, label: "omóplatos hacia abajo"},
          { id:5, label: "definir trayectoria y posición"}
        ],
        "arreglo":[ 
          { id:1, label: "acentuación en tiempos y contratiempos"},
          { id:2, label: "sonidos corto y fuerte"},
          { id:3, label: "sonidos claro y agradable"}
        ]           
      },
      "twist":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "rotación eje vertical "},  
          { id:4, label: "rotación interna y externa"}
        ],
        "direccion":[
          { id:1, label: "Dir 2-8" },
          { id:2, label: "Dir 8-4"},
          { id:3, label: "Dir 4-2"},  
          { id:4, label: "Dir 2-6"}
        ],
        "gesto":[
          { id:1, label: "colera" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "ocho_adelante":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "rotación interna/externa + traslación lateral "},  
          { id:4, label: "torsión maxima de pelvis"},  
          { id:5, label: "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { id:1, label: "Dir 6-4" },
          { id:2, label: "Dir 4-8"},
          { id:3, label: "Dir 8-6"},  
          { id:4, label: "Dir 6-2"}
        ],
        "gesto":[
          { id:1, label: "Tristeza" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "ocho_atras":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "rotación interna/externa + traslación lateral "},  
          { id:4, label: "torsión maxima de pelvis"},  
          { id:5, label: "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { id:1, label: "Dir 2-8" },
          { id:2, label: "Dir 8-4"},
          { id:3, label: "Dir 4-2"},  
          { id:4, label: "Dir 2-6"}
        ],
        "gesto":[
          { id:1, label: "Amor" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "caderas_arriba_abajo":{
        "caracteristica":[
          { id:1, label: "alternar pies en uno y 1/2" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "inclinacion arriba/abajo"}
        ],
        "direccion":[
          { id:1, label: "Dir 6-4" },
          { id:2, label: "Dir 4-8"},
          { id:3, label: "Dir 8-6"},  
          { id:4, label: "Dir 6-2"}
        ],
        "gesto":[
          { id:1, label: "Maldad" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "recogida":{
        "caracteristica":[
          { id:1, label: "alternar pies en uno y 1/2" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "inclinación arriba/abajo + traslación latera"}
        ],
        "direccion":[
          { id:1, label: "Dir 2-8" },
          { id:2, label: "Dir 8-4"},
          { id:3, label: "Dir 4-2"},  
          { id:4, label: "Dir 2-6"}
        ],
        "gesto":[
          { id:1, label: "Verguenza" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "maya":{
        "caracteristica":[
          { id:1, label: "alternar pies en uno y 1/2" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "inclinación arriba/abajo + traslación latera"}
        ],
        "direccion":[
          { id:1, label: "Dir 6-4" },
          { id:2, label: "Dir 4-8"},
          { id:3, label: "Dir 8-6"},  
          { id:4, label: "Dir 6-2"}
        ],
        "gesto":[
          { id:1, label: "Sorpresa" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "torso":{
        "direccion":[
          { id:1, label: "Dir 2-8" },
          { id:2, label: "Dir 8-4"},
          { id:3, label: "Dir 4-2"},  
          { id:4, label: "Dir 2-6"}
        ],
        "gesto":[
          { id:1, label: "Miedo" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "africana":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "inclinación abajo + retroversión+inclinación abajo+posicion neutra"}
        ],
        "direccion":[
          { id:1, label: "Dir 6-4" },
          { id:2, label: "Dir 4-8"},
          { id:3, label: "Dir 8-6"},  
          { id:4, label: "Dir 6-2"}
        ],
        "gesto":[
          { id:1, label: "Desprecio" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "circulo_pequeno":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "coxis a tierra"},
          { id:3, label: "posición neutra + traslación lateral+inclinación posterior+ traslación lateral"},
          { id:4, label: "piernas en extención"},
          { id:5, label: "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { id:1, label: "Dir 2-8" },
          { id:2, label: "Dir 8-4"},
          { id:3, label: "Dir 4-2"},  
          { id:4, label: "Dir 2-6"}
        ],
        "gesto":[
          { id:1, label: "Alegría" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "circulo_grande":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "posición neutra + traslación lateral+inclinación posterior+ traslaciónlateral+inclinación anterior"},
          { id:3, label: "piernas flexionadas"},
          { id:4, label: "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { id:1, label: "Dir 6-4" },
          { id:2, label: "Dir 4-8"},
          { id:3, label: "Dir 8-6"},  
          { id:4, label: "Dir 6-2"}
        ],
        "gesto":[
          { id:1, label: "Cólera" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "camello_torso":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "Torso: translación adelante y arriba, traslación atras y abajo"},
          { id:3, label: "piernas en extensión"}
        ],
        "direccion":[
          { id:1, label: "Dir 2-8" },
          { id:2, label: "Dir 8-4"},
          { id:3, label: "Dir 4-2"},  
          { id:4, label: "Dir 2-6"}
        ],
        "gesto":[
          { id:1, label: "Tristeza" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "camello_pelvis":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "Pelvis: traslación adelante+retroversión+traslación dorsal+anteroversión+posición inicial"},
          { id:3, label: "piernas en extensión"},
          { id:4, label: "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { id:1, label: "Dir 6-4" },
          { id:2, label: "Dir 4-8"},
          { id:3, label: "Dir 8-6"},  
          { id:4, label: "Dir 6-2"}
        ],
        "gesto":[
          { id:1, label: "Amor" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "reverse_pelvis":{
        "caracteristica":[
          { id:1, label: "plantas en el suelo" },
          { id:2, label: "Pelvis: anteroversión+traslación dorsal+retroversión+traslación adelante+posición inicia"},
          { id:3, label: "piernas en extensión"},
          { id:4, label: "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { id:1, label: "Dir 2-8" },
          { id:2, label: "Dir 8-4"},
          { id:3, label: "Dir 4-2"},  
          { id:4, label: "Dir 2-6"}
        ],
        "gesto":[
          { id:1, label: "Maldad" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad posicion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      }
    },
    "exercise_5":{
      "primera":{
        "crotalos":[
          { id:1, label: "sonido a contratiempo" },
          { id:2, label: "sonido corto y fuerte"},
          { id:3, label: "sonido claro y agradable"} 
        ],
        "arreglo":[
          
        ],
        "gesto":[ 
          { id:1, label: "Verguenza" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad en posicion de cejas"},
          { id:4, label: "claridad poscion de la boca"},
          { id:5, label: "mantener el gesto"}
        ],
        "port_de_bras":[ 
          { id:1, label: "pronación antebrazo (palmas abajo)"},
          { id:2, label: "dar fluidez"},
          { id:3, label: "vigilar ambos brazos"},
          { id:4, label: "omóplatos hacia abajo"},
          { id:5, label: "definir trayectoria y posición. "}
        ],
        "shimmy":[ 
          { id:1, label: "Dar uniformidad"},
          { id:2, label: "mantenerlo mas tiempo"},
          { id:3, label: "comodidad al hacerlo."},
          { id:4, label: "ambas piernas"},
          { id:5, label: "extender piernas"}
        ],
        "secuencia":[ 
          { id:1, label: "Dirección definida"},
          { id:2, label: "nivel definido"},
          { id:3, label: "mov definidos con shimmy"},
          { id:4, label: "claridad al iniciar"},
          { id:5, label: "claridad al finalizar"}
        ],
        "fluidez":[ 
          { id:1, label: "claridad"},
          { id:2, label: "suavidad"},
          { id:3, label: "mov contínuos"}
        ],
        "transiciones":[ 
          { id:1, label: "definición"},
          { id:2, label: "limpieza"},
          { id:3, label: "conexión"},
          { id:4, label: "puntear"}
        ]          
      },
      "segunda":{
        "gesto":[ 
          { id:1, label: "Sorpresa" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad en posicion de cejas"},
          { id:4, label: "claridad poscion de la boca"},
          { id:4, label: "mantener el gesto"}
        ]
      },
      "tercera":{
        "gesto":[ 
          { id:1, label: "Miedo" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad en posicion de cejas"},
          { id:4, label: "claridad poscion de la boca"},
          { id:5, label: "mantener el gesto"}
        ]
      },
      "cuarta":{
        "arreglo":[ 
          { id:1, label: "acentuación en tiempos y contratiempos" },
          { id:2, label: "sonidos corto y fuerte "},
          { id:3, label: "sonidos claro y agradable"}
        ],
        "gesto":[ 
          { id:1, label: "Desprecio" },
          { id:2, label: "claridad en posicion de cejas"},
          { id:3, label: "claridad en posicion de cejas"},
          { id:4, label: "claridad posicion de la boca"},
          { id:5, label: "mantener el gesto"}
        ]
      }
    }    
  };

  // ************** ejecicio 2 
  headers_1: Tile[] = [
    {text: 'fail', cols: 1, rows: 1, color: '#DDBDF1'},
    {text: 'Posicion 1/2 punta', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'pies y piernas', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Shimmi (R,I,U)', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Manos', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Port de bras', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Cráneo', cols: 1, rows: 1, color: 'lightblue'},
    {text: '3', cols: 1, rows: 1, color: 'lightblue'},    
  ];

  headers_2: Tile[] = [
    {text: 'fail', cols: 1, rows: 1, color: '#DDBDF1'},
    {text: 'Posicion 1/2 punta', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'Torso', cols: 2, rows: 1, color: 'lightblue'},
    {text: 'Hombro', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Mentón', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Mov', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Espalda', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Pelvis', cols: 1, rows: 1, color: 'lightblue'},    
    {text: 'Pies y Piernas', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Shimmi (R,I,U)', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Brazos y dedos', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Crotalos a tiempo', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Value 4.0', cols: 1, rows: 1, color: 'lightblue'}
  ];

  headers_3: Tile[] = [
    {text: 'fail', cols: 1, rows: 1, color: '#DDBDF1'},
    {text: 'movimento', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Caracteristicas', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Shimmi (R,I,U)', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Manos y dedos', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Port de bras', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Crótalos a contratiempo', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'valor 11', cols: 1, rows: 1, color: 'lightblue'}
  ];

  
  headers_4: Tile[] = [
    {text: 'fail', cols: 1, rows: 1, color: '#DDBDF1'},
    {text: 'mov', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Caract', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Shimmy (R,I,U)', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Dir', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Ademan', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Nivel', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Tiempo', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Rostro y Gesto', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Port de bras', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Arreglos crotalos', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'valor 14', cols: 1, rows: 1, color: 'lightblue'}
  ];

  headers_5: Tile[] = [
    {text: 'fail', cols: 1, rows: 1, color: '#DDBDF1'},
    {text: 'serie', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Crot Contra tiempo', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Crotalos Arreglo', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Rostro-Gesto', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Port de bras y Dedos', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Shimmy (R,I,U)', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Serie Inicio y final', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Fluidez en serie', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Transicion en serie', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'valor 8', cols: 1, rows: 1, color: 'lightblue'}
  ];
 
  valores_seleccionados = [];
  razones_seleccionadas = [];
  otras_razones_seleccionadas = [];
  movimientos_cancelados = [];

  exam_id = 0
  estudiante = {}
  maestro = {}
  
  constructor( private route: ActivatedRoute
    , private router: Router
    , public dialog: MatDialog
    , private examService: ExamService
    ) {

      this.exam_id = parseInt(this.route.snapshot.paramMap.get('exam_id'))
      var estudiante_name = this.route.snapshot.paramMap.get('estudiante')

      var obj = {
        "nombre" : estudiante_name
      };
      this.estudiante = obj;
    }

  ngOnInit() {

    this.loadExam()
    
  }


  onChangeReason(exercise_id:string, row_id:string, col_id:string){
    if( !this.isCanceledRow(exercise_id, row_id) )
      this.openReasons(exercise_id, row_id, col_id);
  }
  isSelected(exercise_id:string, row_id:string, col_id:string){
    var result = false;
    if( this.isCanceledRow(exercise_id, row_id) )
      return true;
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
    this.router.navigate(['/ExamenesPendientes']);
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
    console.debug("retriveReasons(" + exercise_id + " " + row_id + " " + col_id + ")")
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
    
    if( !this.movimientos_cancelados[exercise_id] ){
      this.movimientos_cancelados[exercise_id] = [];
    }
    
    if( this.movimientos_cancelados[exercise_id][row_id] ){
      this.movimientos_cancelados[exercise_id][row_id] = false;
    }
    else{
      this.movimientos_cancelados[exercise_id][row_id] = true;
    }   
     
    return false;
    
  }
  setCancelRow(exercise_id:string, row_id:string){
    console.log( "canceling row :"+ exercise_id + " id:" + row_id);
    
    if( !this.movimientos_cancelados[exercise_id] )
      this.movimientos_cancelados[exercise_id] = [];

    this.movimientos_cancelados[exercise_id][row_id] = true;
   
    return false;
    
  }
  isCanceledRow(exercise_id:string, row_id:string){
    if( this.movimientos_cancelados[exercise_id] &&
        this.movimientos_cancelados[exercise_id][row_id] )
        return true;
    return false;
  } 
 
  getTotalByExercise(exercise_id:string){
    if( ! this.exam.exercises[exercise_id] ){
      console.log("ERROR: exercise_id not found for " + exercise_id)
      return 0.0;
    }
    let rowsNumber = this.exam.exercises[exercise_id].rows.length;
    let result = 0.0;
    for( let i=0; i< rowsNumber; i++){
      let r = this.exam.exercises[exercise_id].rows[i];
      result += this.getTotalByRow(exercise_id,r.id);
    }
    return result;
  }  

  getTotal(){
    var sum = 0;
    for(var exercise_id in this.exam.exercises ){
      sum = sum + this.getTotalByExercise(exercise_id)
    }  
    return sum  
  }
  
  isDisabled(exercise_id:string, row_id:string, col_id:string){
    if( this.disabledQuestions[exercise_id] &&
        this.disabledQuestions[exercise_id][row_id] &&
        this.disabledQuestions[exercise_id][row_id][col_id] )
        return this.disabledQuestions[exercise_id][row_id][col_id].disabled;
    return false;
  }
  getRowValue(exercise_id:string, row_id:string){
    let rowsNumber = this.exam.exercises[exercise_id].rows.length;
    let result = 0.0;
    for( let i=0; i< rowsNumber; i++){
      let r = this.exam.exercises[exercise_id].rows[i];
      if( r.id === row_id){
        result = r.rowValue;
        break;
      }
    }
    return result;
  }

  
  getTotalByRow(exercise_id:string, row_id:string){

    if( this.isCanceledRow(exercise_id,row_id ))
      return 0;

    let rowValue = this.getRowValue(exercise_id, row_id);
    let numCols = this.exam.exercises[exercise_id].columns.length

    let numEnabledCols = 0;
    //calculate the value of each checkbox 
    for(let i=0; i<numCols; i++ ){
      var c = this.exam.exercises[exercise_id].columns[i];
      if( !this.isDisabled(exercise_id, row_id, c.id) )
        numEnabledCols++;
    }

    var result = rowValue;
    for(let i=0; i<numCols; i++ ){
      var c = this.exam.exercises[exercise_id].columns[i];
      if( this.isSelected(exercise_id, row_id, c.id) )
        result = result - rowValue/ numEnabledCols;
    }
    return result;
  } 
  
  getRowColor(index:number){
    if( index % 2 ){
      return 'lightgray'
    }
    else return 'white';
  }

  onSubmit(){
    this.submitting = true;

    var valoresSeleccionadosJSON = [];
    for(var exercise_id in this.valores_seleccionados ){
      for(var row_id in this.valores_seleccionados[exercise_id]){
        for(var col_id in this.valores_seleccionados[exercise_id][row_id]){
          console.log( "valores_seleccionados " + exercise_id + "  " + row_id + " " + col_id + " " + this.valores_seleccionados[exercise_id][row_id][col_id] );
          if( this.isSelected(exercise_id, row_id, col_id) ){
            var selected = this.valores_seleccionados[exercise_id][row_id][col_id]
            let obj = {
                "examen_id":1,
                "exercise_id":exercise_id,
                "row_id":row_id,
                "col_id":col_id,
                "is_selected": selected
            };
            valoresSeleccionadosJSON.push( obj )
          }
        }
      }
    }


    var RazonesSeleccionadasJSON = [];
    for(var exercise_id in this.razones_seleccionadas ){
      for(var row_id in this.razones_seleccionadas[exercise_id]){
        for(var col_id in this.razones_seleccionadas[exercise_id][row_id]){
          for(var reason_id in this.razones_seleccionadas[exercise_id][row_id][col_id]){
            if( this.isReasonSelected(exercise_id,row_id, col_id, reason_id)){
              console.log( "razones_seleccionadas " +  exercise_id + "  " + row_id + " " + col_id + " " +  reason_id );
              let obj = {
                "examen_id":this.exam_id,
                "exercise_id":exercise_id,
                "row_id":row_id,
                "col_id":col_id,
                "reason_id":reason_id
              };
              RazonesSeleccionadasJSON.push( obj )
            }
          }
        }
      }
    }




    var otrasRazonesSeleccionadasJSON = [];
    for(var exercise_id in this.otras_razones_seleccionadas ){
      for(var row_id in this.otras_razones_seleccionadas[exercise_id]){
        for(var col_id in this.otras_razones_seleccionadas[exercise_id][row_id]){
          let otra_razon = this.otras_razones_seleccionadas[exercise_id][row_id][col_id]
          console.log( "otras_razones_seleccionadas " + exercise_id + "  " + row_id + " " + col_id + " " +  otra_razon );
          if( otra_razon && otra_razon.length > 0 ){
            let obj = {
              "examen_id":this.exam_id,
              "exercise_id":exercise_id,
              "row_id":row_id,
              "col_id":col_id,
              "otra_razon":otra_razon
            };
            otrasRazonesSeleccionadasJSON.push( obj )
          }
        }
      }
    }



    var movimientosCanceladosJSON = []
    for(var exercise_id in this.movimientos_cancelados ){
      for(var row_id in this.movimientos_cancelados[exercise_id]){
        console.log( "movimientos_cancelados " + exercise_id + "  " + row_id  );
        if( this.isCanceledRow(exercise_id, row_id) ){
          let obj = {
            "examen_id":this.exam_id,
            "exercise_id":exercise_id,
            "row_id":row_id
          }
          movimientosCanceladosJSON.push(obj)
        }
      }
    }

    var totales = [];
    for(var exercise_id in this.exam.exercises ){
      for(var row in this.exam.exercises[exercise_id].rows){
      let row_id = this.exam.exercises[exercise_id].rows[row].id
      let row_total =  this.getTotalByRow(exercise_id, row_id)
        console.log( "totales " + exercise_id + "  " + row_id + " " + row_total);
        let obj = {
          "examen_id":this.exam_id,
          "exercise_id":exercise_id,
          "row_id":row_id,
          "row_total": row_total
        }
        totales.push(obj)
      }
    }
        

    var data = {
      "id":this.exam_id,
      "examen_observaciones": valoresSeleccionadosJSON,
      "razones_seleccionadas" : RazonesSeleccionadasJSON,
      "otras_razones_seleccionadas": otrasRazonesSeleccionadasJSON,
      "movimientos_cancelados": movimientosCanceladosJSON,
      "examen_totales": totales
    }
 



    this.examService.SaveExamen("user.token",data).subscribe(data => {
      console.log( "Exams:" + data );
      alert("completado gracias!")
      this.submitting = false;
    },
    error => {
      alert("ERROR al salvar el examen:" + error)
      this.submitting = false;
    });
  } 

  loadExam(){
    var data = {
      "id":this.exam_id,
    } 

    this.examService.GetExamen("user.token",data).subscribe(data => {
      console.log( "Exams:" + data );

      this.estudiante = data["result"]["estudiante"]
      this.maestro = data["result"]["maestro"]


      var observaciones = data["result"]["examen_observaciones"]
      for(let i in observaciones ){
        this.setSelected(observaciones[i]["exercise_id"], observaciones[i]["row_id"], observaciones[i]["col_id"], observaciones[i]["is_selected"])
      }

      var razones_seleccionadas = data["result"]["razones_seleccionadas"]
      for(let i in razones_seleccionadas ){
        this.setReasonSelected(razones_seleccionadas[i]["exercise_id"], razones_seleccionadas[i]["row_id"], razones_seleccionadas[i]["col_id"], razones_seleccionadas[i]["reason_id"], true)
      } 
      
      var otras_razones_seleccionadas = data["result"]["otras_razones_seleccionadas"]
      for(let i in otras_razones_seleccionadas ){
        this.setOtherReasonsSelected(otras_razones_seleccionadas[i]["exercise_id"], otras_razones_seleccionadas[i]["row_id"], otras_razones_seleccionadas[i]["col_id"], otras_razones_seleccionadas[i]["otra_razon"])
      } 
      
      var movimientos_cancelados = data["result"]["movimientos_cancelados"]
      for(let i in movimientos_cancelados ){
        this.setCancelRow(movimientos_cancelados[i]["exercise_id"], movimientos_cancelados[i]["row_id"])
      }     
    },
    error => {
      console.log( "not found:" + data );
    });    
  }
  
}
