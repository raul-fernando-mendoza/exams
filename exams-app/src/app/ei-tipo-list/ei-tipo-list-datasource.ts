import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Materia } from '../exams/exams.module';
import { ChildrenOutletContexts } from '@angular/router';

// TODO: Replace this with your own data model type

export interface MateriaItemNode {
  nivel_id:string
  nivel_name:string
  group_id?:string
  group_name?:string
  materia_id?:string
  materia_name?:string
  exam_id?:string
  exam_name?:string
  required_in_carrers_ids:Array<string>
  nodeClass:string  
  children:Array<MateriaItemNode>
}

// TODO: replace this with real data from your application
const EXAMPLE_DATA: MateriaItemNode[] = [
  /*
  {id: 1, name: 'Hydrogen'},
  {id: 2, name: 'Helium'},
  */
];

/**
 * Data source for the EiApplicationTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class EiApplicationTableDataSource extends DataSource<MateriaItemNode> {
  data: MateriaItemNode[] = EXAMPLE_DATA;
  paginator: MatPaginator;
  sort: MatSort; 

  constructor(customized_data) {
    super();
    var flattened_data:Array<MateriaItemNode> = []
    this.MateriaItemNodeFlattener( customized_data ,flattened_data)
    this.data = flattened_data
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<MateriaItemNode[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      //this.paginator.page,
      //this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
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
  private getPagedData(data: MateriaItemNode[]) {
    //const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    //return data.splice(startIndex, this.paginator.pageSize);
    return data
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: MateriaItemNode[]) {
    /*
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'label': return compare(a.materia_name, b.materia_name, isAsc);
        default: return 0;
      }
    });
    */
    return data
  }

  MateriaItemNodeFlattener(node_array:MateriaItemNode[], result:Array<MateriaItemNode>){
    for(var idx=0; idx<node_array.length; idx++){
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
