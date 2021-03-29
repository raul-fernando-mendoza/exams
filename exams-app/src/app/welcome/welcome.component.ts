import { Component, OnInit } from '@angular/core';
import { UserLoginService } from '../user-login.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private userLoginService:UserLoginService) { }

  isloggedIn = false
  ngOnInit(): void {
    this.isloggedIn = this.userLoginService.getIsloggedIn()
  }
  
}
