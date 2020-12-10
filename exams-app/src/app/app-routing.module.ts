import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddressFormComponent } from './address-form/address-form.component';
import { NavigationComponent } from './navigation/navigation.component';
import { UserLoginFormComponent } from './user-login-form/user-login-form.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MytableComponent } from './mytable/mytable.component';
import { TreeComponent } from './tree/tree.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ExamenesPendientesComponent } from './examenes-pendientes/examenes-pendientes.component';
import { CustomStepper } from './example-custome-stepper/example-custom-stepper';
const routes: Routes = [
  { path: 'loginForm', component: LoginFormComponent },
  { path: 'ExamenesPendientes', component: ExamenesPendientesComponent },
  { path: 'stepper', component: CustomStepper},
  { path: 'NavigationComponent', component: NavigationComponent},
  { path: 'Dashboard', component: DashboardComponent},
  { path: 'MytableComponent', component: MytableComponent },
  { path: 'TreeComponent', component: TreeComponent },
  { path: 'DragDropComponent' , component: DragDropComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
