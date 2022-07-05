import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SortingService {

  constructor() { }

  sortBy(arr,fields:Array<string>){
    var ordered = arr.sort( (a, b) => {
      for( var i=0; i<fields.length; i++){
        if(  a[fields[i]] > b[fields[i]] )
          return 1
        else if( a[fields[i]] < b[fields[i]] )
          return -1      
      }
      return 0
    })    
    return ordered
  }
}
