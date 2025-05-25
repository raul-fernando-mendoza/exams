import { Component, OnDestroy, OnInit  } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-videos-list',
 
  templateUrl: './videos-list.component.html',
  styleUrls: ['./videos-list.component.css']
})
export class VideosListComponent implements OnInit {

  constructor(
     private userLoginService: UserLoginService
    ,private examImprovisacionService: ExamenesImprovisacionService) { }

  urls = ["one", "two"]
  
  ngOnInit(): void {

    this.userLoginService.getUserIdToken().then( token => {
      this.initialize(token)
    },
    error => {
      alert("Error in token:" + error.errorCode + " " + error.errorMessage)
    })    
  }
  initialize(token){
    this.urls = []
    var req ={
      "path":"videos/"
    }
    this.examImprovisacionService.gsApiInterface("list", token, req).subscribe(
      data => {
        var urls = data["result"] 
        console.log("delete compled successfully")
        for( let i=0; i<urls.length; i++ ){
          this.urls.push( urls[i] )
        }
      },
      error =>{
        
        alert("error en delete:" + error.error)
      }
    )
  }

}
