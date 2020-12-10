import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { TestApplicationService } from '../test-application.service';
import { TestApplication } from '../TestApplication';
import { UserDetails } from '../UserDetails';
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
  displayedColumns = ['id', 'name'];
  
  constructor( 
    private router: Router, 
      private testApplicationService: TestApplicationService) {

      }

  ngOnInit() {
    this.dataSource = new ExamenesPendientesDataSource();
    


  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    var newdata:ExamenesPendientesItem[] = [];
    
    var user:UserDetails = JSON.parse(localStorage.getItem('exams.app'));
    if( user ){
      alert("user:" + user);

      this.testApplicationService.testApplications(user.token).subscribe(data => {
        console.log( "testApplications:" + data );
        
        for(var i=0; i<data.length; i++){
          var t:TestApplication = data[i];
          var e:ExamenesPendientesItem = {
            name : t.test.test_name,
            id : t.id
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
    alert(row.id)
  } 
}
