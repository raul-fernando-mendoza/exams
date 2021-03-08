import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MytableComponent } from './mytable/mytable.component';
import { TreeComponent } from './tree/tree.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ExamenesPendientesComponent } from './examenes-pendientes/examenes-pendientes.component';
import { ReasonSelectionComponent } from './reason-selection/reason-selection.component';
import { ExamSimpleComponent } from './exam-simple/exam-simple.component';
import { GraphComponent } from './graph/graph.component';
import { ExamenesImprovisacionComponent } from "./examenes-improvisacion/examenes-improvisacion.component";
import { ExamenImprovisacionFormComponent } from "./examen-improvisacion-form/examen-improvisacion-form.component"
import { EiApParameterFormComponent } from "./ei-ap-parameter-form/ei-ap-parameter-form.component"
const routes: Routes = [
  { path: 'loginForm', component: LoginFormComponent },
  
  { path: 'ExamenesPendientes', component: ExamenesPendientesComponent },
  { path: 'NavigationComponent', component: NavigationComponent},
  { path: 'Dashboard', component: DashboardComponent},
  { path: 'MytableComponent', component: MytableComponent },
  { path: 'TreeComponent', component: TreeComponent },
  { path: 'DragDropComponent' , component: DragDropComponent},
  { path: 'Reason', component: ReasonSelectionComponent},
  { path: 'simple-exam', component: ExamSimpleComponent },
  { path: 'graph', component: GraphComponent },
  
  { path: 'ExamenesImprovisacion', component: ExamenesImprovisacionComponent },
  { path: 'ExamenImprovisacionFormComponent', component: ExamenImprovisacionFormComponent },
  { path: 'ei-ap-parameter-form-component', component: EiApParameterFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
