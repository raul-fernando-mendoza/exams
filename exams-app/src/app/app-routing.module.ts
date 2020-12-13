import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MytableComponent } from './mytable/mytable.component';
import { TreeComponent } from './tree/tree.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ExamenesPendientesComponent } from './examenes-pendientes/examenes-pendientes.component';
import { ExamApplicationComponent } from './exam-application/exam-application.component';

const routes: Routes = [
  { path: 'loginForm', component: LoginFormComponent },
  { path: 'ExamenesPendientes', component: ExamenesPendientesComponent },
  { path: 'NavigationComponent', component: NavigationComponent},
  { path: 'Dashboard', component: DashboardComponent},
  { path: 'MytableComponent', component: MytableComponent },
  { path: 'TreeComponent', component: TreeComponent },
  { path: 'DragDropComponent' , component: DragDropComponent},
  { path: 'ExamApplication', component: ExamApplicationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
