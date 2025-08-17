import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StringService {

  constructor() { }

  removeDiacritics(input:string){
        var output = "";

        var normalized = input.normalize("NFD");
        var i=0;
        var j=0;

        while (i<input.length)
        {
            output += normalized[j];

            j += (input[i] == normalized[j]) ? 1 : 2;
            i++;
        }

        return output;    
    }  
}
