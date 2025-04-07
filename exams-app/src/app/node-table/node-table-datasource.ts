import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of as observableOf, merge, of } from 'rxjs';

// TODO: Replace this with your own data model type
export class NodeTableRow {
  obj:{}
  opened:boolean
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
export class NodeTableDataSource extends DataSource<NodeTableRow> {
  data: NodeTableRow[] = EXAMPLE_DATA;
  paginator: MatPaginator;
  flattened_data:Array<NodeTableRow>
  cnt = 0



  constructor(customized_data) {
    super();
    this.flattened_data = Array<NodeTableRow>()
    this.NodeFlattener( customized_data ,this.flattened_data)
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
      this.paginator.page
    ];



    let observable = new Observable<NodeTableRow[]>( subscriber =>{
      

      this.paginator.page.subscribe( e =>{
        subscriber.next( this.getPagedData(this.getSortedData([...this.data])) )
      })

      this.cnt = 0
      for( let idx = 0; idx < this.data.length; idx++){
        if( this.data[idx].nodeClass == 'examGrade' ){
          this.cnt++;
        }
      }
            
     
      subscriber.next( this.getPagedData(this.getSortedData([...this.data])) )
    }) 



    return observable
/*
    return merge(dataMutations).pipe(map((e) => {
      console.log(e)
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
    */
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
    let result = []
    let cnt = -1
    for( let idx = 0; idx < data.length; idx++){
      if( data[idx].nodeClass == 'examGrade' ){
        cnt++;
        if( cnt >= this.paginator.pageSize + (this.paginator.pageIndex * this.paginator.pageSize)){
          break
        }
          
      }
      
      if( cnt>=this.paginator.pageIndex * this.paginator.pageSize ){
        result.push( data[idx] )
      }
    }
    return result
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: NodeTableRow[]) {
      return data;
  }
  
  NodeFlattener(node_array:NodeTableRow[], result:Array<NodeTableRow>){
    for(var idx=0; node_array!=null && idx<node_array.length; idx++){
      var node = node_array[idx]
      result.push(node)
      var list = this.NodeFlattener( node.children, result)     
    };
  }

  getSize():number{
    return this.cnt
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
