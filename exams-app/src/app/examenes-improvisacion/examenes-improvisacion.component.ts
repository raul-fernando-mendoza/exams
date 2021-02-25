import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ExamenesImprovisacionDataSource, ExamenesImprovisacionItem } from './examenes-improvisacion-datasource';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-examenes-improvisacion',
  templateUrl: './examenes-improvisacion.component.html',
  styleUrls: ['./examenes-improvisacion.component.css']
})
export class ExamenesImprovisacionComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ExamenesImprovisacionItem>;
  dataSource: ExamenesImprovisacionDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'estudiante_name', 'fechaApplicacion', 'completado'];
  
  constructor( private route: ActivatedRoute
    , private router: Router
    , private examImprovisacionService: ExamenesImprovisacionService
    ) {

  }
  ngOnInit() {
    
    this.examImprovisacionService.getExamsImproApplication("user.token","", "", "","").subscribe(data => {
      console.log( "Exams:" + data );
      let datavalues: ExamenesImprovisacionItem[] = [];

      var examImprovisationArray = data["result"];

      for(var i=0; i<examImprovisationArray.length;i++){
        let exam = examImprovisationArray[i]
        console.log(exam.id)
        var obj = {
          "id": exam.id, 
          "estudiante_name": exam.estudiante.nombre, 
          "fechaApplicacion":exam.fechaApplicacion.substring(0, 10), 
          "completado": exam.completado 
        }
        datavalues.push(obj)
      }
      this.dataSource = new ExamenesImprovisacionDataSource(datavalues);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;    
    },
    error => {
      alert("ERROR al leer:" + error)
      
    });    
  }

  ngAfterViewInit() {

  }
  onCreate(){
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }
}
