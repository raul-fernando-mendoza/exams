import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { UserLoginService } from './user-login.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { NavigationComponent } from './navigation/navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MytableComponent } from './mytable/mytable.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { TreeComponent } from './tree/tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LoginFormComponent } from './login-form/login-form.component';
import { ExamenesPendientesComponent } from './examenes-pendientes/examenes-pendientes.component';
import { AddressFormComponent } from './address-form/address-form.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReasonSelectionComponent } from './reason-selection/reason-selection.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ExamSimpleComponent } from './exam-simple/exam-simple.component';
import { MatStepperModule} from '@angular/material/stepper';
import { GraphComponent } from './graph/graph.component';
import { ExamenesImprovisacionComponent } from './examenes-improvisacion/examenes-improvisacion.component';
import { ExamenImprovisacionFormComponent } from './examen-improvisacion-form/examen-improvisacion-form.component'; 
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EiApParameterFormComponent, DialogOverviewExampleDialog, DescriptionDialog } from './ei-ap-parameter-form/ei-ap-parameter-form.component';
import { EiApReporteComponent } from './ei-ap-reporte/ei-ap-reporte.component';
import { EiTabHolderComponent } from './ei-tab-holder/ei-tab-holder.component';
import { MatTabsModule} from '@angular/material/tabs';
import { EiApplicationTableComponent } from './ei-application-table/ei-application-table.component';
import { EiTipoEditComponent } from './ei-tipo-edit/ei-tipo-edit.component';
import { ExpansionTestComponent } from './expansion-test/expansion-test.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { StarSliderComponent } from './star-slider/star-slider.component';
import { UsersListComponent } from './users-list/users-list.component';
import { RoleListComponent } from './role-list/role-list.component';
import { LoginSelectorComponent } from './login-selector/login-selector.component';
import { WelcomeComponent } from './welcome/welcome.component'; 
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    MytableComponent,
    DashboardComponent,
    TreeComponent,
    DragDropComponent,
    LoginFormComponent,
    ExamenesPendientesComponent,
    AddressFormComponent,
    ReasonSelectionComponent,
    ExamSimpleComponent,
    GraphComponent,
    ExamenesImprovisacionComponent,
    ExamenImprovisacionFormComponent,
    EiApParameterFormComponent,
    DialogOverviewExampleDialog,
    DescriptionDialog,
    EiApReporteComponent,
    EiTabHolderComponent,
    EiApplicationTableComponent,
    EiTipoEditComponent,
    ExpansionTestComponent,
    StarSliderComponent,
    UsersListComponent,
    RoleListComponent,
    LoginSelectorComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatGridListModule,
    MatMenuModule,
    MatTreeModule,
    DragDropModule,
    MatCheckboxModule,
    MatDialogModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule
  ],
  providers: [
    UserLoginService
  ],
  entryComponents: [
    ReasonSelectionComponent,
    DialogOverviewExampleDialog,
    DescriptionDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
