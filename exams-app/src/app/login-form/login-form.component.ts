import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenesImprovisacionService} from '../examenes-improvisacion.service'

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  loginForm = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required]
  });

  username:string;
  password:string;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, 
    private router: Router, 
    private examImprovisacionService: ExamenesImprovisacionService) {}

  ngOnInit() {
  }

  onSubmit() {
    console.log("login was submitted");
    var login_request = {
      "user":{
          "user_name":this.username,
          "password":this.password,
          "user_role":[{
              "role_id":"" 
          }],
          "user_attribute(+)":[{
              "maestro_id":"",
              "estudiante_id":""
          }]
      }
  }

    this.examImprovisacionService.chenequeApiInterface("login",login_request).subscribe(data => {
      let user = data["result"] ;
      localStorage.setItem('exams.app', JSON.stringify(user));
      this.examImprovisacionService.LoginEvent(user)
      this.gotoWelcomeUser();
    },
    error => {
      localStorage.setItem('exams.app', null);
      this.examImprovisacionService.LoginEvent(null)
      alert("usuario invalido. try again")
    })
  }

  gotoWelcomeUser() {
    this.router.navigate(['/ExamenesImprovisacion']);
  }
}
