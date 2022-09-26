import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { Exam, ExamGrade, Materia, ParameterGrade, User } from '../exams/exams.module';

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

// TODO: Replace this with your own data model type
export interface ExamenesImprovisacionItem {
  exam:Exam
  examGrade:ExamGrade
  parameterGrade:ParameterGrade
  materia:Materia
  student:User
  approver:User
  isCompleted:boolean
}

// TODO: replace this with real data from your application
const EXAMPLE_DATA: ExamenesImprovisacionItem[] = [];

/**
 * Data source for the ExamenesImprovisacion view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ExamenesImprovisacionDataSource extends DataSource<ExamenesImprovisacionItem> {
  data: ExamenesImprovisacionItem[] = EXAMPLE_DATA;
  paginator: MatPaginator;
  sort: MatSort;

  constructor(newdata: ExamenesImprovisacionItem[]) {
    super();
    this.data = newdata;
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ExamenesImprovisacionItem[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(dataMutations).pipe(map(() => {
      console.log("sort:" + this.sort.active + " " + this.sort.direction)
      var jsonExamenesSort = { 
        "active":this.sort.active,
        "direction":this.sort.direction
      }
      localStorage.setItem("jsonExamenesSort",JSON.stringify(jsonExamenesSort))
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ExamenesImprovisacionItem[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ExamenesImprovisacionItem[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'title': return compare(a.examGrade.title, b.examGrade.title, isAsc);
        case 'materia': return compare(a.exam.label, b.exam.label, isAsc);
        case 'fechaApplicacion': return compareDate(a,b, isAsc);
        case 'estudiante': return compare(a.student.displayName, b.student.displayName, isAsc);
        case 'evaluador': return compare(a.approver.displayName, b.approver.displayName, isAsc);
        case 'parametro': return compare(a.parameterGrade.label, b.parameterGrade.label, isAsc);
        
        case 'completed': return compareCompleted(a.examGrade, b.examGrade, isAsc);        
        
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function compareCompleted(a:ExamGrade, b:ExamGrade, isAsc: boolean) {
  if( a.isCompleted && b.isCompleted)
    return (a.score < b.score ? -1 : 1) * (isAsc ? 1 : -1);
  else
    return (a.isCompleted < b.isCompleted ? -1 : 1) * (isAsc ? 1 : -1);
}

function compareDate(a, b, isAsc: boolean) {
  if (isAsc ){
    if( a.examGrade.applicationDate>b.examGrade.applicationDate ) {
      return 1
    }
    else if( a.examGrade.applicationDate<b.examGrade.applicationDate ){
      return -1
    }
    else{
      return a.examGrade.title > b.examGrade.title ? 1:-1
    } 
  }
  else{
    if( a.examGrade.applicationDate<b.examGrade.applicationDate ) {
      return 1
    }
    else if( a.examGrade.applicationDate>b.examGrade.applicationDate ){
      return -1
    }
    else{
      return a.examGrade.title > b.examGrade.title ? 1:-1
    } 
  }
}
