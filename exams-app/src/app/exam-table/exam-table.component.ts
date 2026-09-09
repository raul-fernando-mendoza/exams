import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, OnInit, signal, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { BusinessService } from '../business.service';
import { CriteriaGrade, User } from '../exams/exams.module';
import { UserLoginService } from '../user-login.service';

import { db } from 'src/environments/environment';
import { NodeTableRow, NodeTableDataSource } from '../node-table/node-table-datasource';
import { UserPreferencesService } from '../user-preferences.service';
import { DateFormatService } from '../date-format.service';
import { FormBuilder } from '@angular/forms';
import { ExamTableModel } from './exam-table.model';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-exam-table',
  standalone: true,
  imports: [
    CommonModule
    , MatIconModule
    , MatButtonModule

    , FormsModule
    , ReactiveFormsModule
    , MatFormFieldModule
    , MatInputModule

    , MatTableModule
    , MatPaginatorModule
    , MatDatepickerModule
    , MatToolbarModule

    , MatProgressSpinnerModule
    , MatMenuModule
    , UserSelectorComponent
    , MatSortModule
    , MatSlideToggleModule

  ],
  templateUrl: './exam-table.component.html',
  styleUrls: ['./exam-table.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExamTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<NodeTableRow>;

  dataSource = signal<NodeTableDataSource>(null);

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['applicationDate', 'titulo', 'alumna', 'completed', 'score', 'release', 'delete'];

  // data itself lives in examTableModel (a root-provided singleton) so it
  // survives this component being dismissed and re-created; this component
  // is just a thin, redrawn-on-change view over it.
  submitting = computed(() => this.examTableModel.loading());

  organization_id = null

  filterForm = this.fb.group({
    studentUid: [""]
  })

  constructor(
    private router: Router
    , private userLoginService: UserLoginService
    , private examImprovisacionService: BusinessService
    , private userPreferencesService: UserPreferencesService
    , public dateFormatService: DateFormatService
    , public fb: FormBuilder
    , private changeDetectorRef: ChangeDetectorRef
    , public examTableModel: ExamTableModel
  ) {
    this.organization_id = userPreferencesService.getCurrentOrganizationId()

    effect(() => {
      this.updateList(this.examTableModel.examGradeList())
    })
  }

  toFixed(num, fixed) {
    if (num == null) {
      return null
    }
    else {
      num = Math.trunc(num * 100) / 100
      return num.toFixed(fixed)
    }
  }

  get applicationDate(): Date | null {
    return this.examTableModel.applicationDate()
  }
  set applicationDate(date: Date | null) {
    // the datepicker's own [(value)] two-way binding writes here directly;
    // route it through the model like every other filter change so it
    // stays the single source of truth and dedupes/resubscribes correctly
    this.examTableModel.setApplicationDate(date)
  }

  ngOnInit() {
    this.filterForm.controls.studentUid.setValue(this.examTableModel.studentUid())
  }

  ngAfterViewInit(): void {
    // the model may already hold data (e.g. we navigated back to this
    // screen) by the time the view -and the paginator/table ViewChilds- are
    // ready, so make sure it gets attached at least once here too
    this.updateList(this.examTableModel.examGradeList())
  }

  private updateList(rows: NodeTableRow[]) {
    if (!this.table) {
      // view not initialized yet; ngAfterViewInit will re-run this once it is
      return
    }
    this.changeDetectorRef.detectChanges()
    let nodeTableDataSource = new NodeTableDataSource(rows)
    this.dataSource.set(nodeTableDataSource);
    if (this.paginator) {
      this.dataSource().paginator = this.paginator;
    }
    this.table.dataSource = this.dataSource();
  }

  onExpandExamGrade(row: NodeTableRow) {
    if (row.nodeClass !== 'examGrade') return
    const examGrade_id = row.obj['id']
    if (row.opened) {
      this.examTableModel.collapseExamGrade(examGrade_id)
    } else {
      this.examTableModel.expandExamGrade(examGrade_id)
    }
  }

  onDelete(title, examGrade_id) {
    if (!confirm("Esta seguro de querer borrar todos los examenes de::" + title)) {
      return
    }
    else {
      db.collection("examGrades").doc(examGrade_id).update({
        isDeleted: true,
        updated_on: new Date()
      }).then(() => {
        console.log("examGrade has been deleted")
        db.collection("examGrades/" + examGrade_id + "/parameterGrades").get().then(
          set => {
            var all_promises = set.docs.map(doc => {
              return doc.ref.update({ "isDeleted": true })
            })
            Promise.all(all_promises).then(
              () => {
                console.log("delete completed")
              }
            )

          }
        )
      },
        reason => {
          console.log("ERROR removing examGrade:" + reason)
        })
    }
  }

  updateRelease(row: NodeTableRow, value: boolean) {
    const examGradeId = row.obj["id"]
    const materia_id = row.obj["materia_id"]
    const exam_id = row.obj["exam_id"]

    const studentUids: string[] = (row.obj["students"] as User[]).map(s => s.uid)

    db.collection("materias/" + materia_id + "/exams/" + exam_id + "/homeworks").get().then(homeworkSet => {
      const homeworks = homeworkSet.docs.map(d => ({ id: d.id, ...(d.data() as {label?:string, idx?:number}) }))

      const studentPromises = studentUids.map(student_uid => {
        return db.collection("materiaEnrollments")
          .where("organization_id", "==", this.organization_id)
          .where("isDeleted", "==", false)
          .where("student_uid", "==", student_uid)
          .where("materia_id", "==", materia_id)
          .get().then(enrollSet => {
            if (enrollSet.empty) return []
            const enrollmentId = enrollSet.docs[0].id
            return Promise.all(homeworks.map(homework => {
              return db.collection("materiaEnrollments").doc(enrollmentId)
                .collection("homeworkScores").doc(homework.id).get().then(scoreDoc => {
                  const score = scoreDoc.exists ? (scoreDoc.data().homework_score ?? 0) : 0
                  return { student_uid, homework_id: homework.id, homework_label: homework.label ?? '', score, idx: homework.idx ?? 0 }
                })
            }))
          })
      })

      Promise.all(studentPromises).then(results => {
        const homeworkGrades = results.flat()
        db.collection("examGrades").doc(examGradeId).update({
          isReleased: value,
          homeworkGrades,
          updated_on: new Date()
        }).then(() => {
          console.log("examGrade was released")
        }, reason => {
          console.log("Examgrade release failed:" + reason)
        })
      })
    })
  }
  isAdmin() {
    return this.userLoginService.hasRole("role-admin-" + this.organization_id)
  }

  private handleTokenError(error) {
    if (error.status == 401) {
      this.router.navigate(['/loginForm']);
    }
    else {
      alert("ERROR al leer lista de improvisacion:" + error.errorCode + " " + error.errorMessage)
    }
  }

  applicationFilterChange(e) {
    let newDate: Date | null = null
    if (e instanceof MatDatepickerInputEvent) {
      newDate = e.value ?? null
    }
    console.log("date changed to:" + newDate)

    this.userLoginService.getUserIdToken().then(
      token => {
        this.examTableModel.setApplicationDate(newDate)
      },
      error => this.handleTokenError(error)
    )
  }


  onCreate() {
    this.router.navigate(['/ExamenImprovisacionFormComponent']);
  }

  onEditParameterGrade(examGrade_id, parameterGrade_id) {
    this.router.navigate(['/examGrade-parameterGrade-apply', { examGrade_id: examGrade_id, parameterGrade_id: parameterGrade_id }]);
  }
  onReset(examGrade_id, parameterGrade_id, title) {
    if (!confirm("Esta seguro de querer limpiar:" + title)) {
      return
    }

    this.resetExamGradeParameter(examGrade_id, parameterGrade_id).then(() => {
      console.log("completed")
    })
      .catch(() => {
        console.log("ERROR: reseteando el examen")
      })

  }
  resetExamGradeParameter(examGrade_id, parameterGrade_id): Promise<void> {

    return new Promise<void>((resolve, reject) => {


      let parameterGradeDoc = db.collection('examGrades/' + examGrade_id + '/parameterGrades').doc(parameterGrade_id)


      parameterGradeDoc.collection('criteriaGrades').get().then(criteriaSet => {
        let criteriaMap = criteriaSet.docs.map(criteriaDoc => {
          return this.resetCriteria(criteriaDoc)
        })
        Promise.all(criteriaMap).then(() => {
          parameterGradeDoc.update({
            isCompleted: false,
            score: 10,
            evaluator_comment: null
          }).then(() => {
            resolve()
          })

        })
          .catch(() => {
            reject()
          })
      })
        .catch(() => {
          reject()
        })
    })


  }


  resetCriteria(criteriaDoc): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let criteriaGrade: CriteriaGrade = criteriaDoc.data() as CriteriaGrade
      criteriaDoc.ref.update({
        score: 10,
        earnedPoints: criteriaGrade.availablePoints
      })
      criteriaDoc.ref.collection('aspectGrades').get().then(aspectGradeSet => {
        let aspectMap = aspectGradeSet.docs.map(aspectGradeDoc => {
          return aspectGradeDoc.ref.update({
            score: 1,
            missingElements: null
          })
        })
        Promise.all(aspectMap).then(() => {
          resolve()
        })
          .catch(() => {
            reject()
          })
      })
        .catch(() => {
          reject()
        })

    })
  }

  onRemoveParameterGrade(examGrade_id, parameterGrade_id, title) {
    if (!confirm("Esta seguro de querer eliminar:" + title)) {
      return
    }

    var req = {
      collection: "examGrades/" + examGrade_id + "/parameterGrades",
      id: parameterGrade_id
    }

    this.userLoginService.getUserIdToken().then(token => {
      this.examImprovisacionService.firestoreApiInterface("deleteCollectionObject", token, req).subscribe(
        {
          next(data) {
            var res = data["result"]
            //now update the examGrade updated_on

            db.collection("examGrades/").doc(examGrade_id).update({ "updated_on": new Date() }).then(
              () => {
                console.log("examgrade has been updated for updated_on")
              },
              reason => {
                alert("Error removiendo parameter:" + reason)
              }
            )
          },
          error(reason) {
            alert("ERROR: removiendo parameter:" + JSON.stringify(reason))
          },
          complete() {
            console.log("never called")
          }
        }
      )
    },
      error => {
        alert("Error in token:" + error.errorCode + " " + error.errorMessage)
      })
  }
  examStudentChange(studentUid) {
    console.log("student selection:" + studentUid)
    this.userLoginService.getUserIdToken().then(
      token => {
        this.examTableModel.setStudentUid(studentUid ? studentUid : "")
      },
      error => this.handleTokenError(error)
    )
  }

  onClearName() {
    this.filterForm.controls.studentUid.setValue("")
    this.examStudentChange("")
  }
  onClearDate() {
    this.applicationFilterChange(null)
  }
}
