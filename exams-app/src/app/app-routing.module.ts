import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';

import { LoginFormComponent } from './login-form/login-form.component';
/*
import { ExamenesPendientesComponent } from './examenes-pendientes/examenes-pendientes.component';
import { ReasonSelectionComponent } from './reason-selection/reason-selection.component';
import { ExamSimpleComponent } from './exam-simple/exam-simple.component';
import { GraphComponent } from './graph/graph.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MytableComponent } from './mytable/mytable.component';
import { TreeComponent } from './tree/tree.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
*/

import { ExamenesImprovisacionComponent } from "./examenes-improvisacion/examenes-improvisacion.component";
import { ExamenImprovisacionFormComponent } from "./examen-improvisacion-form/examen-improvisacion-form.component"
import { EiApParameterFormComponent } from "./ei-ap-parameter-form/ei-ap-parameter-form.component"
import { EiApReporteComponent } from './ei-ap-reporte/ei-ap-reporte.component';
import { EiTabHolderComponent } from './ei-tab-holder/ei-tab-holder.component';
import { EiTipoEditComponent } from './ei-tipo-edit/ei-tipo-edit.component';
import { UsersListComponent } from './users-list/users-list.component';
import { LoginSelectorComponent } from './login-selector/login-selector.component';
import { WelcomeComponent } from './welcome/welcome.component';
const routes: Routes = [
  
  /*
  { path: 'ExamenesPendientes', component: ExamenesPendientesComponent },
  { path: 'Dashboard', component: DashboardComponent},
  { path: 'MytableComponent', component: MytableComponent },
  { path: 'TreeComponent', component: TreeComponent },
  { path: 'DragDropComponent' , component: DragDropComponent},
  { path: 'Reason', component: ReasonSelectionComponent},
  { path: 'simple-exam', component: ExamSimpleComponent },
  { path: 'graph', component: GraphComponent },
  */
  
  { path: 'loginForm', component: LoginFormComponent },
  { path: 'NavigationComponent', component: NavigationComponent},
  { path: 'ExamenesImprovisacion_old', component: ExamenesImprovisacionComponent },
  { path: 'ExamenImprovisacionFormComponent', component: ExamenImprovisacionFormComponent },
  { path: 'ei-ap-parameter-form-component', component: EiApParameterFormComponent },
  { path: 'eiReporte', component: EiApReporteComponent },
  { path: 'ExamenesImprovisacion', component: EiTabHolderComponent },
  { path: 'ei-tipo-edit', component: EiTipoEditComponent },
  { path: 'user-list', component: UsersListComponent },
  { path: 'login-selector', component: LoginSelectorComponent },
  { path: 'home', component: WelcomeComponent },
  { path: 'register', component: LoginFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
