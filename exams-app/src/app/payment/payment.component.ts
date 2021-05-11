import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { StripeScriptTag } from "stripe-angular";
import { StripeclientService } from '../stripeclient.service';

//the server code is at accept-a-card-payment\using-webhooks\server\node
//curl -d '{items: [{ id: "photo-subscription" }], currency: "usd"}' -H 'Content-Type: application/json' http://localhost:4242/create-payment-intent
 

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'] 
})
export class PaymentComponent implements OnInit {

  constructor(
    private stripeScriptTag: StripeScriptTag,
    private stripeservice:StripeclientService ) { 
    if (!this.stripeScriptTag.StripeInstance) {
      this.stripeScriptTag.setPublishableKey('');
    }
  }

  ngOnInit(): void {}

  cardCaptureReady = 0
  invalidError = ""
  cardDetailsFilledOut = ""
  extraData
  payment_method = null
  token = null


  onStripeInvalid( error: Error ){
    console.log('Validation Error', error)
  }

  onStripeError( error: Error ){
    console.error('Stripe error', error)
  }

  setPaymentMethod( token: stripe.paymentMethod.PaymentMethod ){
    console.log('Stripe Payment Method', token)
    this.payment_method = token
  }

  setStripeToken( token: stripe.Token ){
    console.log('Stripe Token', token)
    this.token = token
    this.stripeservice.charge().then( data => {
      console.log( "data:" + JSON.stringify(data) )
      var client_secret = data["clientSecret"]

    

      var card_payment_data:stripe.ConfirmCardPaymentData = { 
        payment_method: {
          card: {
            token: this.token.id
          }
        }
      }
      this.stripeScriptTag.StripeInstance.confirmCardPayment(client_secret,card_payment_data).then(
        payed => {
          console.debug("payed:" + payed)
        },
        rejected => {
          console.debug("rejected:" + rejected)
        }
      )
    },
    reason=>{
      console.log( "reason:" + JSON.stringify(reason) )
    })
  }

  setStripeSource( source: stripe.Source ){
    console.log('Stripe Source', source)
  }
}
