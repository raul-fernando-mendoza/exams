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
import { EiTipoEditComponent } from './ei-tipo-edit/ei-tipo-edit.component';
import { UsersListComponent } from './users-list/users-list.component';
import { LoginSelectorComponent } from './login-selector/login-selector.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { VideosListComponent } from './videos-list/videos-list.component';
import { ExamgradesReportComponent } from './examgrades-report/examgrades-report.component';
import { ExamTableComponent } from './exam-table/exam-table.component';
import { CareerListComponent } from './career-list/career-list.component';
import { CareerEditComponent } from './career-edit/career-edit.component';
import { MateriaCertificatesComponent } from './materia-certificates/materia-certificates.component';
import { MateriaListComponent } from './materia-list/materia-list.component';
import { DialogMateriaDialog } from './materia-edit/materia-edit';
import { CareerUserComponent } from './career-user/career-user.component';
import { CertificateTypeListComponent } from './certificate-type-list/certificate-type-list.component';
import { CertificateTypeEditComponent } from './certificate-type-edit/certificate-type-edit.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component';
import { PaymentComponent } from './payment/payment.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { PasswordResetEmailComponent } from './password-reset-email/password-reset-email.component';
import { VideoMarksComponent } from './video-marks/video-marks.component';
import { CanvasPainterComponent } from './canvas-painter/canvas-painter.component';
import { LaboratoryEditComponent } from './laboratory-edit/laboratory-edit.component';
import { LaboratoryGradeEditComponent } from './laboratory-grade-edit/laboratory-grade-edit.component';
import { LaboratoryGradeListComponent } from './laboratory-grade-list/laboratory-grade-list.component';

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
  { path: 'ExamenesImprovisacion', component: ExamenesImprovisacionComponent },
  { path: 'ei-tipo-edit', component: EiTipoEditComponent },
  { path: 'materia-list', component: MateriaListComponent },  
  { path: 'materia-edit', component: DialogMateriaDialog },  
  { path: 'user-list', component: UsersListComponent },
  { path: 'login-selector', component: LoginSelectorComponent },

  { path: 'register', component: LoginFormComponent },
  { path: 'videos-list', component: VideosListComponent },
  { path: 'grades', component: ExamTableComponent },  
  { path: 'career-list', component: CareerListComponent },  
  { path: 'career-edit', component: CareerEditComponent },  
  { path: 'materiaCertificaciones', component: MateriaCertificatesComponent },  
  { path: 'home', component: WelcomeComponent },
  { path: 'report', component: ExamgradesReportComponent},
  { path: 'career-user', component: CareerUserComponent},
  { path: 'certificate-type-list', component:CertificateTypeListComponent },
  { path: 'certificate-type-edit', component:CertificateTypeEditComponent },
  { path: 'user-profile-edit', component:UserProfileEditComponent },
  { path: 'payment', component:PaymentComponent },
  { path: 'checkout', component:CheckoutComponent },  
  { path: 'password-reset-email', component:PasswordResetEmailComponent },
  { path: 'video-marks', component:VideoMarksComponent },
  { path: 'canvas-painter', component:CanvasPainterComponent },
  { path: 'laboratory-edit', component:LaboratoryEditComponent},
  { path: 'laboratory-grade-edit', component:LaboratoryGradeEditComponent },
  { path: 'laboratory-grade-list', component:LaboratoryGradeListComponent },
  { path: '**', component: WelcomeComponent },  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
