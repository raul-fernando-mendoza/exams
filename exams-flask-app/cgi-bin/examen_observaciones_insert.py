from db import Session
from models import Observacion
import logging


logging.basicConfig( level=logging.DEBUG)
logging.debug('test has started')    

reasonsPerRow = {
    "exercise_1":{
      "primera":{
        "pies":[
          { "id":1, "label": "rotar pie 30' hacia afuera" },
          { "id":2, "label": "apoyar sobre 1' o 2' metatarso"},
          { "id":3, "label": "tobillo hacia adentro"} ,
          { "id":4, "label": "talón hacia atrás"} ,
          { "id":5, "label": "pelvis alineada"} 
        ],
        "shimmi":[
          { "id":1, "label": "uniformidad" },
          { "id":2, "label": "resistencia" },
          { "id":3, "label": "aspecto cómodo" },
          { "id":4, "label": "piernas alternadas" },
          { "id":5, "label": "piernas extendidas" }
        ],
        "palomas":[ 
          { "id":1, "label": "dedos extendidos"},
          { "id":2, "label": "leve separación en dedos"},
          { "id":3, "label": "pulgar en anteposición"}
        ],
        "portdebras":[ 
          { "id":1, "label": "dar suavidad"},
          { "id":2, "label": "dar fluidez"},
          { "id":3, "label": "cuidar ambos brazos"},
          { "id":4, "label": "omóplatos hacia abajo"},
          { "id":5, "label": "definir trayectoria y posición"}
        ],
        "craneo":[ 
          { "id":1, "label": "mentón recto"},
          { "id":2, "label": "cuello alineado"}
        ]        
      },
      "segunda":{
        "pies":[
          { "id":1, "label": "Rotar pie 30' hacia afuera" },
          { "id":2, "label": "Apoyar sobre 1' o 2' metatarso"},
          { "id":3, "label": "tobillo hacia adentro (aduccion)"},  
          { "id":4, "label": "talón hacia atras"},
          { "id":5, "label": "caderas hacia enfrente"}
        ]
      },
      "tercera":{
        "pies":[ 
          { "id":1, "label": "pies en perpendicular" },
          { "id":2, "label": "apoyar sobre 1' o 2' metatarso"},
          { "id":3, "label": "tobillo hacia adentro (aducción)"},
          { "id":4, "label": "talón hacia atrás"},
          { "id":5, "label": "torso en torsión caderas en diagonal"}
        ]
      },
      "cuarta":{
        "pies":[
          { "id":1, "label": "rotar pie 30' hacia afuera" },
          { "id":2, "label": "apoyar sobre pulgar y 1' metatarso"},
          { "id":3, "label": "tobillo hacia abajo"},  
          { "id":4, "label": "talón hacia atrás"},
          { "id":5, "label": "caderas hacia enfrente"} 
        ]
      },
      "quinta":{ 
        "pies":[
          { "id":1, "label": "rotar pie 30' hacia afuera" },
          { "id":2, "label": "apoyar sobre pulgar y 1' metatarso"},
          { "id":3, "label": "tobillo hacia abajo"},  
          { "id":4, "label": "talón hacia atrás"},
          { "id":5, "label": "caderas hacia enfrente"} 
        ]
      }
    },
    "exercise_2":{
      "segunda":{
        "hombros":[
          { "id":1, "label": "omóplatos hacia abajo y atrás"},
          { "id":2, "label": "presión descendente en los hombros"} ,
          { "id":3, "label": "elongar el cuello"} ,
          { "id":4, "label": "no mover los hombros"} 
        ],
        "menton":[
          { "id":1, "label": "cuello-mentón = ángulo 90°" },
          { "id":2, "label": "cuello sobre la vertical" },
          { "id":3, "label": "bajar el menton" }
        ],
        "movimiento":[ 
          { "id":1, "label": "Definicion" },
          { "id":2, "label": "Aplitud"},
          { "id":3, "label": "Disociación"}
        ],
        "espalda":[ 
          { "id":1, "label": "espalda recta"},
          { "id":2, "label": "mov sobre el plano horizontal"}
        ],
        "caderas":[ 
          { "id":1, "label": "Estatica"},
          { "id":2, "label": "Frontal"},
          { "id":3, "label": "Sobre la vertical"}
        ],
        "pies":[
          { "id":1, "label": "rotar pie 30° hacia afuera" },
          { "id":2, "label": "apoyar sobre pulgar y  1° metatarso"},
          { "id":3, "label": "tobillo hacia abajo"} ,
          { "id":4, "label": "talón hacia atrás"} 
        ],
        "shimmi":[
          { "id":1, "label": "uniformidad" },
          { "id":2, "label": "resistencia" },
          { "id":3, "label": "aspecto cómodo" },
          { "id":4, "label": "piernas alternadas" },
          { "id":5, "label": "piernas extendidas" }
        ],        
        "brazos":[
          { "id":1, "label": "Precisión en brazos" },
          { "id":2, "label": "Manos en pronación"},
          { "id":3, "label": "Extender los dedos"} ,
          { "id":4, "label": "Juntar dedos en la lateral"} ,
          { "id":5, "label": "separar dedos en la vertical"} 
        ],
        "crotalos":[
          { "id":1, "label": "mantener crótalos separados" },
          { "id":2, "label": "fuera de tiempo"},
          { "id":3, "label": "a contratiempo"},
          { "id":4, "label": "claridad en el sonido"} 
        ]		
      },
      "primera":{
        "movimiento":[
          { "id":1, "label": "Definir cada movimiento" },
          { "id":2, "label": "Altura"},
          { "id":4, "label": "Mantener la superficie de apoyo."}
        ],
		"espalda":[
          { "id":1, "label": "espalda recta" },
          { "id":2, "label": "mov sobre el plano vertical"}
        ],
		"pies":[
          { "id":1, "label": "rotar pie 30° hacia afuera" },
          { "id":2, "label": "apoyar sobre 1° o 2° metatarso"},
          { "id":3, "label": "tobillo hacia adentro (aducción)"} ,
          { "id":4, "label": "talón hacia atrás"} ,
          { "id":5, "label": "caderas hacia enfrente"} 
		    ]
      },
      "cuarta":{
        "movimiento":[ 
          { "id":1, "label": "Definir cada movimiento" },
          { "id":2, "label": "Altura"},
          { "id":3, "label": "Amplitud"},
          { "id":4, "label": "Mantener la superficie de apoyo"}
        ],
		    "espalda":[
          { "id":1, "label": "espalda recta" },
          { "id":2, "label": "mov sobre el plano vertical"},
		      { "id":3, "label": "mov sobre el plano horizontal"}
        ],
		    "pies":[
            { "id":1, "label": "rotar pie 30° hacia afuera" },
            { "id":2, "label": "apoyar sobre 1° o 2° metatarso"},
            { "id":3, "label": "tobillo hacia adentro (aducción)"} ,
            { "id":4, "label": "talón hacia atrás"} ,
            { "id":5, "label": "caderas hacia enfrente"} 
        ]
      },
      "fenix":{ 
        "movimiento":[
          { "id":1, "label": "Definir cada movimiento" },
          { "id":2, "label": "Volumen"},
          { "id":3, "label": "abdómen adentro"}
        ],
		    "espalda":[
          { "id":1, "label": "espalda recta" },
          { "id":2, "label": "mov en circunducción"}
        ],
		    "pies":[
            { "id":1, "label": "rotar pie 30° hacia afuera" },
            { "id":2, "label": "apoyar sobre pulgar y  1° metatarso"},
            { "id":3, "label": "tobillo hacia abajo "} ,
            { "id":4, "label": "talón hacia atrás"} ,
            { "id":5, "label": "caderas hacia enfrente"} 
		    ]
      }
    },
    "exercise_3":{
      "caderas":{
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "desconectar caderas y torso"} ,
          { "id":4, "label": "traslaciones laterales de la pelvis"} ,
          { "id":5, "label": "alejamiento máx. de pelvis"} 
        ],
        "shimmy":[
          { "id":1, "label": "Dar uniformidad" },
          { "id":2, "label": "mantenerlo mas tiempo" },
          { "id":3, "label": "comodidad al hacerlo." },
          { "id":4, "label": "ambas piernas" },
          { "id":5, "label": "extender piernas" }
        ],
        "manos":[ 
          { "id":1, "label": "prolongar línea del brazo" },
          { "id":2, "label": "dedos proximales bajando el medio "},
          { "id":3, "label": "pulgar en oposición"},
          { "id":4, "label": "dedo indice y pulgar separados"},
          { "id":5, "label": "muñecas en línea media"}
        ],
        "port_de_bras":[ 
          { "id":1, "label": "pronación antebrazo (palmas abajo)"},
          { "id":2, "label": "dar fluidez"},
          { "id":3, "label": "vigilar ambos brazos "},
          { "id":4, "label": "omóplatos hacia abajo "},
          { "id":5, "label": "definir trayectoria y posición."}
        ],
        "crotalos":[ 
          { "id":1, "label": "sonido a contratiempo"},
          { "id":2, "label": "sonido corto y fuerte"},
          { "id":3, "label": "sonido claro y agradable"}
        ]	
      },
      "twist":{
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "rotación eje vertical"},
          { "id":4, "label": "rotación interna y externa"}
        ]
      },
      "ocho_adelante":{
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "rotación interna/externa + traslación lateral"},
          { "id":4, "label": "torsión maxima de pelvis"},
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ]
      },
      "ocho_atras":{
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "rotación interna/externa + traslación lateral"},
          { "id":4, "label": "torsión maxima de pelvis"},
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ]
      },
      "caderas_arriba_abajo":{
        "caracteristicas":[
          { "id":1, "label": "alternar pies en uno y 1/2" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "inclinacion arriba/abajo + traslación lateral"}
        ]
      },
      "recogida":{
        "caracteristicas":[
          { "id":1, "label": "alternar pies en uno y 1/2" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "inclinacion arriba/abajo"}
        ]
      },
      "maya":{
        "caracteristicas":[
          { "id":1, "label": "alternar pies en uno y 1/2" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "inclinación arriba/abajo + traslación lateral"}
        ]
      },
      "africana":{ 
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "inclinación abajo + retroversión+inclinación abajo+posicion neutra."}
        ]
      },
      "circulo_pequeno":{ 
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "posición neutra + traslación lateral+inclinación posterior+ traslación lateral "},
          { "id":4, "label": "piernas en extención"},
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ]
      },
      "circulo_grande_d":{ 
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "posición neutra + traslación lateral+inclinación posterior+ traslación lateral+inclinación anterior"},
          { "id":3, "label": "piernas flexionadas"},
          { "id":4, "label": "alejamiento máx. de pelvis"}
        ]
      },
      "circulo_grande_i":{ 
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "posición neutra + traslación lateral+inclinación posterior+ traslación lateral+inclinación anterior"},
          { "id":3, "label": "piernas flexionadas"},
          { "id":4, "label": "alejamiento máx. de pelvis"}
        ]
      },
      "camello_reverse_d":{ 
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "Torso: translación adelante y arriba, traslación atras y abajo"},
          { "id":3, "label": "Pelvis: traslación adelante+retroversión+traslación dorsal+anteroversión+posición inicial"},
          { "id":4, "label": "piernas en extensión"},
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ]
      },
      "camello_reverse_i":{ 
        "caracteristicas":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "Torso: translación adelante y arriba, traslación atras y abajo"},
          { "id":3, "label": "Pelvis: traslación adelante+retroversión+traslación dorsal+anteroversión+posición inicial"},
          { "id":4, "label": "piernas en extensión"},
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ]
      }
    },
    "exercise_4":{
      "caderas":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "desconectar caderas y torso"} ,
          { "id":4, "label": "traslaciones laterales de la pelvis"} ,
          { "id":5, "label": "alejamiento máx. de pelvis"} 
        ],
        "shimmy":[
          { "id":1, "label": "Dar uniformidad" },
          { "id":2, "label": "Mantenerlo más tiempo" },
          { "id":3, "label": "comodidad al hacerlo" },
          { "id":4, "label": "ambas piernas" },
          { "id":5, "label": "extender piernas" }
        ],
        "direccion":[ 
          { "id":1, "label": "Dir 6-4" },
          { "id":2, "label": "Dir 4-8"},
          { "id":3, "label": "Dir 8-6"},
          { "id":4, "label": "Dir 6-2"}
        ],
        "ademanes":[ 
          { "id":1, "label": "Inicial: Brazo extendido hacia arriba en supinación, dedos distales"},
          { "id":2, "label": "Brazos extendidos frontal, manos juntas, dedos distales"},
          { "id":3, "label": "Brazo flexionado, mano sobre la nariz. El otro brazo en la cadera"},
          { "id":4, "label": "Brazo flexionado cubriendo la boca: El otro brazo flexionado sobre el pecho"},
          { "id":5, "label": "Final: Brazos en 5a posición, dedos distales"}
        ],
        "nivel":[ 
          { "id":1, "label": "planta"},
          { "id":2, "label": "releve"},
          { "id":3, "label": "releve flotado"}
        ],
        "tiempo":[ 
          { "id":1, "label": "a dos tiempos"},
          { "id":2, "label": "a tiempo"},
          { "id":3, "label": "contínuo"}
        ],
        "gesto":[ 
          { "id":1, "label": "Alegría"},
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ],
        "portdebras":[ 
          { "id":1, "label": "pronación antebrazo (palmas abajo)"},
          { "id":2, "label": "dar fluidez"},
          { "id":3, "label": "vigilar ambos brazos"},
          { "id":4, "label": "omóplatos hacia abajo"},
          { "id":5, "label": "definir trayectoria y posición"}
        ],
        "arreglo":[ 
          { "id":1, "label": "acentuación en tiempos y contratiempos"},
          { "id":2, "label": "sonidos corto y fuerte"},
          { "id":3, "label": "sonidos claro y agradable"}
        ]           
      },
      "twist":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "rotación eje vertical "},  
          { "id":4, "label": "rotación interna y externa"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 2-8" },
          { "id":2, "label": "Dir 8-4"},
          { "id":3, "label": "Dir 4-2"},  
          { "id":4, "label": "Dir 2-6"}
        ],
        "gesto":[
          { "id":1, "label": "colera" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "ocho_adelante":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "rotación interna/externa + traslación lateral "},  
          { "id":4, "label": "torsión maxima de pelvis"},  
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 6-4" },
          { "id":2, "label": "Dir 4-8"},
          { "id":3, "label": "Dir 8-6"},  
          { "id":4, "label": "Dir 6-2"}
        ],
        "gesto":[
          { "id":1, "label": "Tristeza" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "ocho_atras":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "rotación interna/externa + traslación lateral "},  
          { "id":4, "label": "torsión maxima de pelvis"},  
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 2-8" },
          { "id":2, "label": "Dir 8-4"},
          { "id":3, "label": "Dir 4-2"},  
          { "id":4, "label": "Dir 2-6"}
        ],
        "gesto":[
          { "id":1, "label": "Amor" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "caderas_arriba_abajo":{
        "caracteristica":[
          { "id":1, "label": "alternar pies en uno y 1/2" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "inclinacion arriba/abajo"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 6-4" },
          { "id":2, "label": "Dir 4-8"},
          { "id":3, "label": "Dir 8-6"},  
          { "id":4, "label": "Dir 6-2"}
        ],
        "gesto":[
          { "id":1, "label": "Maldad" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "recogida":{
        "caracteristica":[
          { "id":1, "label": "alternar pies en uno y 1/2" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "inclinación arriba/abajo + traslación latera"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 2-8" },
          { "id":2, "label": "Dir 8-4"},
          { "id":3, "label": "Dir 4-2"},  
          { "id":4, "label": "Dir 2-6"}
        ],
        "gesto":[
          { "id":1, "label": "Verguenza" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "maya":{
        "caracteristica":[
          { "id":1, "label": "alternar pies en uno y 1/2" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "inclinación arriba/abajo + traslación latera"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 6-4" },
          { "id":2, "label": "Dir 4-8"},
          { "id":3, "label": "Dir 8-6"},  
          { "id":4, "label": "Dir 6-2"}
        ],
        "gesto":[
          { "id":1, "label": "Sorpresa" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "torso":{
        "direccion":[
          { "id":1, "label": "Dir 2-8" },
          { "id":2, "label": "Dir 8-4"},
          { "id":3, "label": "Dir 4-2"},  
          { "id":4, "label": "Dir 2-6"}
        ],
        "gesto":[
          { "id":1, "label": "Miedo" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "africana":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "inclinación abajo + retroversión+inclinación abajo+posicion neutra"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 6-4" },
          { "id":2, "label": "Dir 4-8"},
          { "id":3, "label": "Dir 8-6"},  
          { "id":4, "label": "Dir 6-2"}
        ],
        "gesto":[
          { "id":1, "label": "Desprecio" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "circulo_pequeno":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "coxis a tierra"},
          { "id":3, "label": "posición neutra + traslación lateral+inclinación posterior+ traslación lateral"},
          { "id":4, "label": "piernas en extención"},
          { "id":5, "label": "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 2-8" },
          { "id":2, "label": "Dir 8-4"},
          { "id":3, "label": "Dir 4-2"},  
          { "id":4, "label": "Dir 2-6"}
        ],
        "gesto":[
          { "id":1, "label": "Alegría" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "circulo_grande":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "posición neutra + traslación lateral+inclinación posterior+ traslaciónlateral+inclinación anterior"},
          { "id":3, "label": "piernas flexionadas"},
          { "id":4, "label": "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 6-4" },
          { "id":2, "label": "Dir 4-8"},
          { "id":3, "label": "Dir 8-6"},  
          { "id":4, "label": "Dir 6-2"}
        ],
        "gesto":[
          { "id":1, "label": "Cólera" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "camello_torso":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "Torso: translación adelante y arriba, traslación atras y abajo"},
          { "id":3, "label": "piernas en extensión"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 2-8" },
          { "id":2, "label": "Dir 8-4"},
          { "id":3, "label": "Dir 4-2"},  
          { "id":4, "label": "Dir 2-6"}
        ],
        "gesto":[
          { "id":1, "label": "Tristeza" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "camello_pelvis":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "Pelvis: traslación adelante+retroversión+traslación dorsal+anteroversión+posición inicial"},
          { "id":3, "label": "piernas en extensión"},
          { "id":4, "label": "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 6-4" },
          { "id":2, "label": "Dir 4-8"},
          { "id":3, "label": "Dir 8-6"},  
          { "id":4, "label": "Dir 6-2"}
        ],
        "gesto":[
          { "id":1, "label": "Amor" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      },
      "reverse_pelvis":{
        "caracteristica":[
          { "id":1, "label": "plantas en el suelo" },
          { "id":2, "label": "Pelvis: anteroversión+traslación dorsal+retroversión+traslación adelante+posición inicia"},
          { "id":3, "label": "piernas en extensión"},
          { "id":4, "label": "alejamiento máx. de pelvis"}
        ],
        "direccion":[
          { "id":1, "label": "Dir 2-8" },
          { "id":2, "label": "Dir 8-4"},
          { "id":3, "label": "Dir 4-2"},  
          { "id":4, "label": "Dir 2-6"}
        ],
        "gesto":[
          { "id":1, "label": "Maldad" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad posicion de la boca"},
          { "id":4, "label": "mantener el gesto"}
        ]
      }
    },
    "exercise_5":{
      "primera":{
        "crotalos":[
          { "id":1, "label": "sonido a contratiempo" },
          { "id":2, "label": "sonido corto y fuerte"},
          { "id":3, "label": "sonido claro y agradable"} 
        ],
        "arreglo":[
          
        ],
        "gesto":[ 
          { "id":1, "label": "Verguenza" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad en posicion de cejas"},
          { "id":4, "label": "claridad poscion de la boca"},
          { "id":5, "label": "mantener el gesto"}
        ],
        "port_de_bras":[ 
          { "id":1, "label": "pronación antebrazo (palmas abajo)"},
          { "id":2, "label": "dar fluidez"},
          { "id":3, "label": "vigilar ambos brazos"},
          { "id":4, "label": "omóplatos hacia abajo"},
          { "id":5, "label": "definir trayectoria y posición. "}
        ],
        "shimmy":[ 
          { "id":1, "label": "Dar uniformidad"},
          { "id":2, "label": "mantenerlo mas tiempo"},
          { "id":3, "label": "comodidad al hacerlo."},
          { "id":4, "label": "ambas piernas"},
          { "id":5, "label": "extender piernas"}
        ],
        "secuencia":[ 
          { "id":1, "label": "Dirección definida"},
          { "id":2, "label": "nivel definido"},
          { "id":3, "label": "mov definidos con shimmy"},
          { "id":4, "label": "claridad al iniciar"},
          { "id":5, "label": "claridad al finalizar"}
        ],
        "fluidez":[ 
          { "id":1, "label": "claridad"},
          { "id":2, "label": "suavidad"},
          { "id":3, "label": "mov contínuos"}
        ],
        "transiciones":[ 
          { "id":1, "label": "definición"},
          { "id":2, "label": "limpieza"},
          { "id":3, "label": "conexión"},
          { "id":4, "label": "puntear"}
        ]          
      },
      "segunda":{
        "gesto":[ 
          { "id":1, "label": "Sorpresa" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad en posicion de cejas"},
          { "id":4, "label": "claridad poscion de la boca"},
          { "id":5, "label": "mantener el gesto"}
        ]
      },
      "tercera":{
        "gesto":[ 
          { "id":1, "label": "Miedo" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad en posicion de cejas"},
          { "id":4, "label": "claridad poscion de la boca"},
          { "id":5, "label": "mantener el gesto"}
        ]
      },
      "cuarta":{
        "arreglo":[ 
          { "id":1, "label": "acentuación en tiempos y contratiempos" },
          { "id":2, "label": "sonidos corto y fuerte "},
          { "id":3, "label": "sonidos claro y agradable"}
        ],
        "gesto":[ 
          { "id":1, "label": "Desprecio" },
          { "id":2, "label": "claridad en posicion de cejas"},
          { "id":3, "label": "claridad en posicion de cejas"},
          { "id":4, "label": "claridad posicion de la boca"},
          { "id":5, "label": "mantener el gesto"}
        ]
      }
    }    
}


    
if __name__ == '__main__':

    logging.debug("Observacion called")
    session = Session()       
    
    for exercise in reasonsPerRow:
        print(exercise)
        for row in reasonsPerRow[exercise]:
            print("\t{}".format(row))
            for col in reasonsPerRow[exercise][row]:
                print("\t\t{}".format(col))
                for observacion in reasonsPerRow[exercise][row][col]:
                    print("\t\t\t{}".format(observacion))
                    observacion = Observacion(tipo_examen_id=1, exercise_id=exercise, row_id=row, col_id=col, reason_id=observacion["id"], reason_label=observacion["label"])
                    session.add(observacion)

    #session.add(observacion)
    session.commit()
    session.close()

