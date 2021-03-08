import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';

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
  id: number;
  materia:string;
  estudiante: string;
  maestro: string;
  tipo:string;
  parametro: string;

  fechaApplicacion: string;
  completado:boolean;
}

// TODO: replace this with real data from your application
const EXAMPLE_DATA: ExamenesImprovisacionItem[] = [
  {id: 1, materia:"espada", estudiante: 'Maria', maestro:"Petra", tipo:"tecnica1", parametro:"tecnica1", fechaApplicacion:formatDate(new Date(2021,1,1)), completado:false},
  {id: 2, materia:"taxim",  estudiante: 'Petra', maestro:"Soila", tipo:"tecnica1", parametro:"tecnica2", fechaApplicacion:formatDate(new Date(2021,3,2)), completado:true}
];

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
        case 'estudiante': return compare(a.estudiante, b.estudiante, isAsc);
        case 'materia': return compare(a.materia, b.materia, isAsc);
        case 'maestro': return compare(a.maestro, b.maestro, isAsc);
        case 'id': return compare(+a.id, +b.id, isAsc);
        case 'parametro': return compare(+a.parametro, +b.parametro, isAsc);
        case 'fechaApplicacion': return compare(+Date.parse(a.fechaApplicacion), +Date.parse(b.fechaApplicacion), isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
