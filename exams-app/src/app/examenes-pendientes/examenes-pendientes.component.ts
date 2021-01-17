import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { Exam } from '../Exam';
import { ExamService } from '../exam-service';
import { UserLoginCredentials } from '../UserLoginCredentials';
import { ExamenesPendientesDataSource, ExamenesPendientesItem } from './examenes-pendientes-datasource';


@Component({
  selector: 'app-examenes-pendientes',
  templateUrl: './examenes-pendientes.component.html',
  styleUrls: ['./examenes-pendientes.component.css']
})
export class ExamenesPendientesComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ExamenesPendientesItem>;
  dataSource: ExamenesPendientesDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'label','studentName', 'teacherName','completed','grade','applicationDate'];
  
  constructor( 
    private router: Router, 
      private examService: ExamService) {

      }

  ngOnInit() {
    this.dataSource = new ExamenesPendientesDataSource();
    


  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    var newdata:ExamenesPendientesItem[] = [];
    
    //var user:UserLoginCredentials = JSON.parse(localStorage.getItem('exams.app'));
    var user:UserLoginCredentials={
    username: "claudia",
    token: "abc",
    roles: ["ADMIN","USER"]
    };

    if( user ){
      

      this.examService.Exams(user.token).subscribe(data => {
        console.log( "Exams:" + data );
        
        for(var i=0; i<data['result'].length; i++){
          var t:Exam = data['result'][i];
          var e:ExamenesPendientesItem = {
            "id": t.id,
            "label": t.label,
            "studentName": t.studentName,
            "teacherName": t.teacherName,
            "grade": t.grade,
            "completed": t.completed,
            "applicationDate": t.applicationDate
          }
          newdata.push(e);
        }
        this.table.dataSource = newdata;
      });      

    }
    else this.gotoLogin();
  }
  gotoLogin() {
    this.router.navigate(['/loginForm']);
  } 
  handleRowClick(row){
    
    this.gotoExamApplication(row.id);
  } 
  gotoExamApplication(examid: number) {
    //alert(examid);
    this.router.navigate(['/simple-exam',{exam_id:examid}]);
  } 

}
