import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmlService {

  constructor() { }

  replace_html(phrase:string){
    if( phrase ){
      var regex
      regex = /^\-(.*)$/igm;
      phrase = phrase.replace(regex, "<li>$1</li>")
      regex = /\<\/li\>\n/igm;
      phrase = phrase.replace(regex, "</li>")    
      regex = /\*(.*)\*/igm;
      phrase = phrase.replace(regex, "<b>$1</b>")    
      regex = /\n/igm;
      phrase = phrase.replace(regex, "</br>")     
     
    } 
    return phrase
  }  
}
