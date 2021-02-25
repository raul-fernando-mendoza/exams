import { AnimationDriver } from '@angular/animations/browser';
import { IfStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'node_modules/chart.js';
import { ExamService } from '../exam-service';
import { ObservationService } from '../observation-service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html', 
  styleUrls: ['./graph.component.css']
})



export class GraphComponent implements OnInit {

  exam_id = 0
  exam = null
  myChart = null
  examen_tipo_observaciones = null

  constructor(private route: ActivatedRoute
    , private router: Router
    , private examService: ExamService
    , private observationService: ObservationService) { 
      this.exam_id = parseInt(this.route.snapshot.paramMap.get('exam_id'))
    }

  ngOnInit(): void {
    this.loadExam(1)


    this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {
          labels: ['Ejer.1', 'Ejer.2', 'Ejer.3', 'Ejer.4', 'Ejer.5'],
          datasets: [{
              label: 'Calificacion a 10',
              data: [0,0,0,0,0],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
    });

    

    

  }

 

  getAlumnaNombre(){
    console.log( "getAlumnaNombre called" );
    var name = "";
    if(this.exam != null){
      name = this.exam["estudiante"].nombre + " " + this.exam["estudiante"].apellidoPaterno;
    }
    return name;
  }
  getCalificacion(){
    
    if( this.exam == null){
      return 0;
    }
    else{

      var exercises = this.exam.tipoExamen.exercises;
      var total_by_exercise  = 0
      for( let i=0; i<exercises.length; i++){
        for( let j=0; j<exercises[i].rows.length; j++){
          total_by_exercise += exercises[i].rows[j].row_value
        }
      }

      var totals=this.exam.row_total
      var earned_by_exercise = 0
      for( let i=0; i< totals.length; i++){
        earned_by_exercise += this.exam.row_total[i].row_total
      }  
     
      return Math.round((  earned_by_exercise / total_by_exercise ) * 1000)/100
    }
   
  }

  getRowColor(index:number){
    if( index % 2 ){
      return 'lightgray'
    }
    else return 'white';
  }

  getExercises(){
    console.log( "getExercises called" );
    var exercises = [
      { 
        label:"demo exercises1",
        exercise_id:"exercise_1",
        exercise_value:3
      },
      {
        label:"demo exercise2",
        exercise_id:"exercise_2",
        exercise_value:4
      }
    ];
    if( this.exam != null){
      exercises = this.exam.tipoExamen.exercises;
    }
    return exercises;
  }  

  getRowLabel(exercise_id, row_id){
    var label = null;
    var exercises = this.exam.tipoExamen.exercises

    //search in rowCol
    for(let e=0;e<exercises.length; e++){
      if( exercises[e].exercise_id === exercise_id ){
        for( let r=0; r<exercises[e].rows.length; r++){
          var rowColumnElement = exercises[e].rows[r]
          if( rowColumnElement.row_id === row_id  )
              return rowColumnElement.label
        }
      }
    }
  }
  getColLabel(exercise_id, col_id){
    var label = null;
    var exercises = this.exam.tipoExamen.exercises

    //search in rowCol
    for(let e=0;e<exercises.length; e++){
      if( exercises[e].exercise_id === exercise_id ){
        for( let c=0; c<exercises[e].cols.length; c++){
          var col = exercises[e].cols[c]
          if( col.col_id === col_id  )
              return col.label
        }
      }
    }
  }  

  getRowColElementLabel(exercise_id, row_id, col_id, reason_id){
    var label = null;
    var exercises = this.exam.tipoExamen.exercises

    //search in rowCol
    for(let e=0;e<exercises.length; e++){
      if( exercises[e].exercise_id === exercise_id ){
        for( let rce=0; rce<exercises[e].rowColElements.length; rce++){
          var rowColumnElement = exercises[e].rowColElements[rce]
          if( rowColumnElement.row_id === row_id &&
              rowColumnElement.col_id === col_id &&
              rowColumnElement.row_col_element_id === reason_id )
              return rowColumnElement.label
        }
      }
    }
    //if not found continue search in cols
    for(let e=0;e<exercises.length; e++){
      if( exercises[e].exercise_id === exercise_id ){
        var exercise = exercises[e]
        for( let c=0 ; c< exercise.cols.length; c++){
          var col =  exercise.cols[c]
          for( let ce=0; ce<col.colElements.length; ce++){
            var columnElement = col.colElements[ce]
            if( columnElement.exercise_id === exercise_id &&
                columnElement.col_id === col_id &&
                columnElement.col_element_id === reason_id )
                return columnElement.label
          }
        }
      }
    }    
  
    return null   
  }



  getRowColElements(exercise_id){
    
    var observations = [
      {
        
        row_label:"1'",
        col_label:"pies y piernas",
        observation_label:"Rotar pie 30' hacia afuera"
      },
      {
       
        row_label:"2'",
        col_label:"Hombro",
        observation_label:"El hombro estuvo mal",
      },
      {
       
        row_label:"Balance'",
        col_label:"Caracteristicas",
        observation_label:"la caracteristica no se cunplio",
      }            
    ]
    
    if( this.exam != null){
      observations = Array();
      var row_col_element_selected = this.exam.row_col_element_selected
      for(let i=0; i<row_col_element_selected.length; i++){
        
        var rowColElementSelected = row_col_element_selected[i]  
        if( rowColElementSelected.exercise_id === exercise_id ){
          var rowLabel = this.getRowLabel( rowColElementSelected.exercise_id,  rowColElementSelected.row_id )
          var colLabel = this.getColLabel( rowColElementSelected.exercise_id,  rowColElementSelected.col_id  )
          var label = this.getRowColElementLabel(rowColElementSelected.exercise_id,  rowColElementSelected.row_id, rowColElementSelected.col_id,rowColElementSelected.reason_id)
          observations.push({
            row_label:rowLabel,
            col_label:colLabel,
            observation_label:label
          })
        }
      }
    }
    return observations;
  }

  getRowColText(exercise_id){
    var rowColTextList = Array();

    if ( this.exam === null ){
      rowColTextList.push({
      row_label:"rowText",
      col_label:"rowText",
      observation_label:"label"
      })
    }
    else{
    
      var row_col_text = this.exam.row_col_text
      for(let i=0; i<row_col_text.length; i++){
        
        var rowColText = row_col_text[i]  
        if( rowColText.exercise_id === exercise_id ){
          var rowLabel = this.getRowLabel( rowColText.exercise_id,  rowColText.row_id )
          var colLabel = this.getColLabel( rowColText.exercise_id,  rowColText.col_id  )

          rowColTextList.push({
            row_label:rowLabel,
            col_label:colLabel,
            observation_label:rowColText.otra_razon
            })
        }
      }
    }
    return rowColTextList

  }

  getRowSelected(exercise_id){
    var rowList = Array();

    if ( this.exam === null ){
      rowList.push({
      row_label:"rowText"
      })
    }
    else{
    
      var row_selected = this.exam.row_selected
      for(let i=0; i<row_selected.length; i++){
        
        var rowSelected = row_selected[i]  
        if( rowSelected.exercise_id === exercise_id ){
          var rowLabel = this.getRowLabel( rowSelected.exercise_id,  rowSelected.row_id )

          rowList.push({
            row_label:rowLabel
          })
        }
      }
    }
    return rowList

  }  

  loadExam(application_id){


    this.examService.GetExamApplication("user.token",application_id).subscribe(data => {
      console.log( "Exams:" + data );
      this.exam = data["result"]

      var calificaciones = this.getAllExercisesTotal();

      this.myChart.data.datasets[0].data = calificaciones;
      this.myChart.update();

      
    },
    error => {
      console.log( "not found:" );
    });


    
    this.observationService.GetObservation("user.token",1).subscribe(data => {
      console.log( "Exams:" + data );

      this.examen_tipo_observaciones = data["result"]
      
    },
    error => {
      console.log( "not found:");
    });    
    
  }  

  getExerciseTotal(exercise_id){
    var sum:number = 0.0;
    if( this.exam != null ){
      for(let i=0; i<this.exam["examen_totales"].length; i++  ){
        if( this.exam["examen_totales"][i].exercise_id === exercise_id)
          sum = sum +  this.exam["examen_totales"][i].row_total 
      }  
    }
    var exercises = this.getExercises()
    var total_exercise;
    for( let i=0; i<exercises.length; i++){
      if( exercises[i].exercise_id === exercise_id )
        total_exercise = exercises[i].exercise_value
    }
    return sum/total_exercise; 
  }

  getAllExercisesTotal(){
    var result = [0, 0, 0, 0, 0]
    

    if( this.exam != null ){

      var exercises = this.exam.tipoExamen.exercises;
      result = new Array(exercises.length)

      var total_by_exercise  = new Array(exercises.length).fill(0)
      for( let i=0; i<exercises.length; i++){
        for( let j=0; j<exercises[i].rows.length; j++){
          total_by_exercise[ exercises[i].exercise_id -1 ] += exercises[i].rows[j].row_value
        }
      }

      var totals=this.exam.row_total
      var earned_by_exercise = new Array(exercises.length).fill(0)
      for( let i=0; i< totals.length; i++){
        earned_by_exercise[ this.exam.row_total[i].exercise_id -1] += this.exam.row_total[i].row_total
      }  

      for( let i=0; i<exercises.length; i++){
        result[ i ] = Math.round((  earned_by_exercise[i] / total_by_exercise[i] ) * 100)/10
      }

    }
    return result;    
  }

  isCanceledRow(exercise_id:string, row_id:string){
    if( this.exam["movimientos_cancelados"][exercise_id] &&
        this.exam["movimientos_cancelados"][exercise_id][row_id] )
        return true;
    return false;
  }  
   
}
