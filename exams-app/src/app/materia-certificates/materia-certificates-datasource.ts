import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { Career, Exam, ExamGrade, Materia, MateriaEnrollment, User } from '../exams/exams.module';

// TODO: Replace this with your own data model type
export interface NodeTableRow {
  user:User
  materiaEnrollment?:MateriaEnrollment
  materia?:Materia
  exam?:Exam
  examGrade?:ExamGrade
  career?:Career
  opened:boolean
  parent:NodeTableRow
  children:Array<NodeTableRow>
  nodeClass:string
  isLeaf:boolean
}

// TODO: replace this with real data from your application
const EXAMPLE_DATA: NodeTableRow[] = [
];

/**
 * Data source for the MateriaCertificates view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class MateriaCertificatesDataSource extends DataSource<NodeTableRow> {
  data: NodeTableRow[] = EXAMPLE_DATA;
  paginator: MatPaginator;
  sort: MatSort;
  flattened_data:Array<NodeTableRow>

  constructor(customized_data) {
    super();
    this.flattened_data = Array<NodeTableRow>()
    this.MateriaItemNodeFlattener( customized_data ,this.flattened_data)
    this.data = this.flattened_data    
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<NodeTableRow[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(dataMutations).pipe(map(() => {
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
  private getPagedData(data: NodeTableRow[]) {
    return data
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: NodeTableRow[]) {
      return data;
  }
  
  MateriaItemNodeFlattener(node_array:NodeTableRow[], result:Array<NodeTableRow>){
    for(var idx=0; node_array!=null && idx<node_array.length; idx++){
      var node = node_array[idx]
      result.push(node)
      var list = this.MateriaItemNodeFlattener( node.children, result)     
    };
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
