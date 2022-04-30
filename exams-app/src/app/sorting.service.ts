import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SortingService {

  constructor() { }

  sortBy(arr,field:string){
    var ordered = arr.sort( (a, b) => {
      if(  a[field] > b[field] )
        return 1
      else if( a[field] < b[field] )
        return -1
      else return 0
    })    
    return ordered
  }
}
