import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { db, environment } from 'src/environments/environment';
import { UserLoginService } from '../user-login.service';
import { UserPreferencesService } from '../user-preferences.service';
import { Materia } from '../exams/exams.module';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  payment_intent:any
  payment_intent_client_secret:any
  materiaId:string
  materia:Materia

  constructor(
    private route: ActivatedRoute
    ,private examenesImprovisacionService:ExamenesImprovisacionService
    ,private userLoginService: UserLoginService
    ,private userPreferencesService: UserPreferencesService
  ) {
    console.log(route)
    this.payment_intent = this.route.snapshot.queryParams['payment_intent']
    this.payment_intent_client_secret = this.route.snapshot.queryParams['payment_intent_client_secret']
   }

  enroll(): void {
    this.examenesImprovisacionService.createMateriaEnrollment(
      this.userPreferencesService.getCurrentOrganizationId(), 
      this.materiaId,
      this.userLoginService.getUserUid()).then( () =>{
        db.collection("materias").doc(this.materiaId).get().then( materiaDoc => {
          this.materia = materiaDoc.data() as Materia
        },
        reason =>{
          alert("ERROR: reading materia:" + reason)
        })
    },
    reason => {
      alert("usted ya esta enrollado en esta materia")
    })    
  }
  ngOnInit(){
    this.examenesImprovisacionService.stripeGetPaymentIntent(this.payment_intent).toPromise().then( data =>{
      const result = data["result"]
      const metadata = result["metadata"]
      this.materiaId =  metadata["materiaId"]
      this.enroll()

      
    },
    reason =>{
      alert("ERROR get payment")
    })
  }

}
