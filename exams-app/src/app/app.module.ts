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
import { EiApReporteComponent } from './ei-ap-reporte/ei-ap-reporte.component';
import { EiTabHolderComponent } from './ei-tab-holder/ei-tab-holder.component';
import { MatTabsModule} from '@angular/material/tabs';
import { EiTipoEditComponent } from './ei-tipo-edit/ei-tipo-edit.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { StarSliderComponent } from './star-slider/star-slider.component';
import { UsersListComponent } from './users-list/users-list.component';
import { RoleListComponent } from './role-list/role-list.component';
import { WelcomeComponent } from './welcome/welcome.component'; 
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { VideosListComponent } from './videos-list/videos-list.component';
import { AppVjsPlayerComponent } from './app-vjs-player/app-vjs-player.component';
import { ExamgradesReportComponent } from './examgrades-report/examgrades-report.component';
import { ExamTableComponent } from './exam-table/exam-table.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CareerDialog, CareerListComponent } from './career-list/career-list.component';
import { CareerEditComponent } from './career-edit/career-edit.component';
import { DialogMateriaDialog } from './materia-edit/materia-edit';
import { DialogEnrollMateriaDialog, MateriaCertificatesComponent } from './materia-certificates/materia-certificates.component';
import { MateriaListComponent } from './materia-list/materia-list.component';
import { DialogNameDialog } from './name-dialog/name-dlg';
import { DialogListSelectDialog } from './list-select/list-select-dialog';
import { CareerUserComponent } from './career-user/career-user.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { CertificateTypeListComponent } from './certificate-type-list/certificate-type-list.component';
import { CertificateTypeEditComponent } from './certificate-type-edit/certificate-type-edit.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component';
import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from '../environments/environment';
import { QuillModule } from 'ngx-quill';
import { PaymentComponent } from './payment/payment.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { PasswordResetEmailComponent } from './password-reset-email/password-reset-email.component'
import { VideoMarksComponent } from './video-marks/video-marks.component';
import { CanvasPainterComponent } from './canvas-painter/canvas-painter.component';
import { LaboratoryEditComponent } from './laboratory-edit/laboratory-edit.component';
import { LaboratoryGradeEditComponent } from './laboratory-grade-edit/laboratory-grade-edit.component';
import { LaboratoryGradeListComponent } from './laboratory-grade-list/laboratory-grade-list.component';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { UserSelectorComponent } from './user-selector/user-selector.component';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { FileLoaderComponent } from './file-loader/file-loader.component';
import { TimerDialog } from './timer-dialog/timer-dlg';
import { MateriaEnrollmentsListComponent } from './materia-enrollments-list/materia-enrollments-list.component';

import { MateriaLaboratoryListComponent } from './materia-laboratory-list/materia-laboratory-list.component';
import { MateriaExamsListComponent } from './materia-exams-list/materia-exams-list.component';
import { ReferenceComponent } from './reference-list/reference-list';
import { ReferenceDialog } from './reference-edit/reference-edit';
import { ExamGradesSearchComponent } from './exam-grades-search/exam-grades-search.component';
import { ExamGradesListComponent } from './exam-grades-list/exam-grades-list.component';
import { YtPlayerAngularModule } from 'yt-player-angular';
import { SoundfileEditComponent } from './soundfile-edit/soundfile-edit.component';
import { RevisionListComponent } from './revision-list/revision-list.component';
import { RevisionEditComponent } from './revision-edit/revision-edit.component';
import { FileControlComponent } from './file-control/file-control.component';
import { RevisionCreateDialog } from './revision-create-dialog/revision-create-component';
import { ExamgradeParameterGradeApplyComponent } from './examgrade-parameter-apply/examGrade-parameterGrade-apply.component';
import { ParameterGradeApplyComponent } from './examgrade-parameter-apply/parametergrade-apply.component';
import { CriteriaGradeApplyComponent } from './examgrade-parameter-apply/criteriagrade-apply.component';
import { CommentApplyDialog } from './examgrade-parameter-apply/comment-apply-dlg';
import { DescriptionApplyDialog } from './examgrade-parameter-apply/description-apply-dlg';
import { AspectGradeStarsApplyComponent } from './examgrade-parameter-apply/aspectgrade-stars-apply.component';
import { ParameterGradeCommentDialog } from './examgrade-parameter-apply/parameterGrade-comment-dlg';
import { ParameterGradeDescriptionDialog } from './examgrade-parameter-apply/parameterGrade-description-dlg';
import { AspectGradeItemsApplyComponent } from './examgrade-parameter-apply/aspectgrade-items-apply.component';
import { ComputestatusComponent } from './computestatus/computestatus.component';

@NgModule({
    declarations: [
        AppComponent,
        NavigationComponent,
        MytableComponent,
        LoginFormComponent,
        ExamenesImprovisacionComponent,
        ExamenImprovisacionFormComponent,
        EiApReporteComponent,
        EiTabHolderComponent,
        EiTipoEditComponent,
        StarSliderComponent,
        UsersListComponent,
        RoleListComponent,
        WelcomeComponent,
        VideosListComponent,
        AppVjsPlayerComponent,
        ExamgradesReportComponent,
        ExamTableComponent,
        DialogMateriaDialog,
        CareerListComponent,
        CareerEditComponent,
        CareerDialog,
        MateriaCertificatesComponent,
        DialogEnrollMateriaDialog,
        MateriaListComponent,
        DialogNameDialog,
        TimerDialog,
        DialogListSelectDialog,
        CareerUserComponent,
        CertificateTypeListComponent,
        CertificateTypeEditComponent,
        UserProfileEditComponent,
        PaymentComponent,
        CheckoutComponent,
        PasswordResetEmailComponent,
        VideoMarksComponent,
        CanvasPainterComponent,
        LaboratoryEditComponent,
        LaboratoryGradeEditComponent,
        LaboratoryGradeListComponent,
        DateSelectorComponent,
        UserSelectorComponent,
        FileLoaderComponent,
        ReferenceComponent,
        ReferenceDialog,
        MateriaEnrollmentsListComponent,
        ExamGradesSearchComponent,
        MateriaLaboratoryListComponent,
        MateriaExamsListComponent,
        ExamGradesListComponent,
        SoundfileEditComponent,
        RevisionListComponent,
        RevisionEditComponent,
        FileControlComponent,
        RevisionCreateDialog,
        ExamgradeParameterGradeApplyComponent,
        ParameterGradeApplyComponent,
        CriteriaGradeApplyComponent,
        AspectGradeStarsApplyComponent,
        AspectGradeItemsApplyComponent,
        CommentApplyDialog,
        DescriptionApplyDialog,
        ParameterGradeCommentDialog,
        ParameterGradeDescriptionDialog,
        ComputestatusComponent

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
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        ClipboardModule,
        MatProgressBarModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        QuillModule,
        MatAutocompleteModule,
        YtPlayerAngularModule
    ],
    providers: [
        UserLoginService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: {
                siteKey: environment.recaptcha.siteKey,
            } as RecaptchaSettings,
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
