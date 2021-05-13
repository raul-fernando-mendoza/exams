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
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LoginFormComponent } from './login-form/login-form.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule} from '@angular/material/stepper';
import { ExamenesImprovisacionComponent } from './examenes-improvisacion/examenes-improvisacion.component';
import { ExamenImprovisacionFormComponent } from './examen-improvisacion-form/examen-improvisacion-form.component'; 
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { EiApParameterFormComponent, DialogOverviewExampleDialog, DescriptionDialog } from './ei-ap-parameter-form/ei-ap-parameter-form.component';
import { EiApReporteComponent } from './ei-ap-reporte/ei-ap-reporte.component';
import { EiTabHolderComponent } from './ei-tab-holder/ei-tab-holder.component';
import { MatTabsModule} from '@angular/material/tabs';
import { EiTipoListComponent } from './ei-tipo-list/ei-tipo-list.component';
import { EiTipoEditComponent } from './ei-tipo-edit/ei-tipo-edit.component';
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
    LoginFormComponent,
    ExamenesImprovisacionComponent,
    ExamenImprovisacionFormComponent,
    EiApParameterFormComponent,
    DialogOverviewExampleDialog,
    DescriptionDialog,
    EiApReporteComponent,
    EiTabHolderComponent,
    EiTipoListComponent,
    EiTipoEditComponent,
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
    ,{ provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  entryComponents: [
    DialogOverviewExampleDialog,
    DescriptionDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
