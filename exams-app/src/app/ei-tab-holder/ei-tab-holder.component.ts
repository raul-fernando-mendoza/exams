import { Component, OnInit } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';


@Component({
  selector: 'app-ei-tab-holder',
  templateUrl: './ei-tab-holder.component.html',
  styleUrls: ['./ei-tab-holder.component.css']
})
export class EiTabHolderComponent implements OnInit {
  link = "/loginForm"
  isAdmin = false
  constructor(private userLoginService: UserLoginService) { }

  ngOnInit(): void {
    this.isAdmin = this.userLoginService.hasRole("admin")
  }

}
