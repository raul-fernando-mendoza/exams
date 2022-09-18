import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {loadStripe} from '@stripe/stripe-js';
import { ExamenesImprovisacionService } from '../examenes-improvisacion.service';
import { UserLoginService } from '../user-login.service';
import { db } from 'src/environments/environment';
import { Materia } from '../exams/exams.module';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit , AfterViewInit{


  stripe:any
  productId:string
  materiaId:string
  materia:Materia

  product:{
    product_id:string,
    product_name:string,
    default_price:number    
  } 
// This is your test publishable API key.

// The items the customer wants to buy
items = [{ id: "xl-tshirt" }];

elements;

  constructor(
    private examenesImprovisacionService:ExamenesImprovisacionService
    , private route: ActivatedRoute
    , private userLoginService:UserLoginService
    ) { 
      this.productId = this.route.snapshot.paramMap.get('productId')
      this.materiaId = this.route.snapshot.paramMap.get('materiaId')
    }

  ngOnInit(): void {

    this.examenesImprovisacionService.stripeGetProduct(this.productId).toPromise().then( data =>{
      this.product = data["result"]

    })

    db.collection("materias").doc( this.materiaId ).get().then( materiaDoc =>{
      this.materia = materiaDoc.data() as Materia
    })

  }


  ngAfterViewInit(): void {
    this.setLoading(true);
    loadStripe('pk_test_51KsBwvFedVXPScZdpx3he4qqmwvUNAPVvtEFavxuamN08DIU2CJ5anXjRth86pLx3SNu6Q5C03FOLFgkjfYB60my00NBo8ad9u').then(
      stripe =>{
        this.stripe = stripe
        this.initialize();
        this.checkStatus();
      }
    )    

  }


  // Fetches a payment intent and captures the client secret
  async initialize() {
    var items = this.items

    const metadata = {
      "materiaId":this.materiaId
    }
    this.examenesImprovisacionService.stripeCreatePaymentIntent('prod_MNGiZUsnJ1PA2t', metadata).toPromise().then( data =>{
      var result = data["result"]
      var clientSecret = result["clientSecret"]

      const appearance = {
        theme: 'stripe',
      };
      this.elements = this.stripe.elements({ appearance, clientSecret });
  
      const paymentElement = this.elements.create("payment");
      paymentElement.mount("#payment-element");   
      paymentElement.on("ready", () => {
        this.setLoading(false);   
      })
    },
    reason =>{
      alert("ERROR: reading string:" + reason)
    })


  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setLoading(true);
    var elements = this.elements

    const { error } = await this.stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page

        return_url: window.origin + "/checkout",
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      this.showMessage(error.message);
    } else {
      this.showMessage("An unexpected error occurred.");
    }

    this.setLoading(false);
  }

  // Fetches the payment intent status after payment submission
  async checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    const { paymentIntent } = await this.stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
      case "succeeded":
        this.showMessage("Payment succeeded!");
        break;
      case "processing":
        this.showMessage("Your payment is processing.");
        break;
      case "requires_payment_method":
        this.showMessage("Your payment was not successful, please try again.");
        break;
      default:
        this.showMessage("Something went wrong.");
        break;
    }
  }

  // ------- UI helpers -------

  showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
      messageContainer.classList.add("hidden");
      //messageText.textContent = "";
    }, 4000);
  }

  // Show a spinner on payment submission
  setLoading(isLoading) {
    if (isLoading) {
      // Disable the button and show a spinner
      document.querySelector("#submit").setAttribute("enabled", "false") ;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("#submit").setAttribute("enabled", "True");
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  }
}
