import { Component, OnDestroy, OnInit  } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import videojs from 'video.js'

@Component({
  selector: 'app-videos-list',
  templateUrl: './videos-list.component.html',
  styleUrls: ['./videos-list.component.css']
})
export class VideosListComponent implements OnInit  {
  // see options: https://github.com/videojs/video.js/blob/maintutorial-options.html

  

  constructor(
     private userLoginService: UserLoginService
    ,private examImprovisacionService: ExamenesImprovisacionService) { }

  video_url = 'https://storage.googleapis.com/celtic-bivouac-307316.appspot.com/videos/Ana_Video_Largo.MOV?Expires=1626135124&GoogleAccessId=firebase-adminsdk-pbsww%40celtic-bivouac-307316.iam.gserviceaccount.com&Signature=UxIfgqwhndzz9uHLvG%2FjCYaeCFk%2FPADL%2FQcQIxg%2FxOGMVlJUbrc4s79Oew0xJ60lFC2EGJYUE5kn%2F%2B4AxamGXQsqUxXRYJE83RwAfoVmzXBbRm36l0sy2YGlFuqSYadRDcvw5pINtg4xi1bdF8Lbb4z7q5ck%2BG4KvDvhKjTV5Ubb9F9f52x859IZ02vkXPH%2Br5djrL%2Fmk2mDaxZvpejbvcqQ7%2BRV53c3nDHVROi0d%2FvPLcqJtiDRkN2VOFwoYhZhZkJ7TjrvU5f2tNec82TyLZm8iZS%2BSey59b8ROwZcIHcnmqtLnKPp5wtWhauClw6T85jsANG%2BRCgZn4XuZ4ZJfQ%3D%3D'
  urls = []
  
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
