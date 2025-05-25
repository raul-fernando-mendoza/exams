import { Component, OnInit } from '@angular/core';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import {MatTabsModule} from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ei-tab-holder',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule   

    ,MatTabsModule  
  ],

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
