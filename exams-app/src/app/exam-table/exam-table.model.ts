import { Injectable, signal } from '@angular/core';
import { db } from 'src/environments/environment';
import { ExamGrade, ParameterGrade, User } from '../exams/exams.module';
import { NodeTableRow } from '../node-table/node-table-datasource';
import { UserPreferencesService } from '../user-preferences.service';
import { UserLoginService } from '../user-login.service';
import { BusinessService } from '../business.service';
import { DateFormatService } from '../date-format.service';

/**
 * Holds the exam-table data (top-level examGrades plus any expanded
 * parameterGrade/homework children) and keeps it in sync with Firestore.
 *
 * This is a root-provided singleton on purpose: it is created once and kept
 * alive for the lifetime of the app, independent of the exam-table
 * component's own lifecycle. That means:
 *  - the Firestore listeners stay open and the data stays warm even after
 *    the exam-table screen is dismissed, so navigating back to it is
 *    instant instead of re-querying everything from scratch;
 *  - re-entering the screen with the same date/estudiante filters reuses
 *    the already-open listener instead of opening a new one;
 *  - Firestore updates are applied incrementally via `docChanges()`, so
 *    only the rows that actually changed are touched/rebuilt (and the row
 *    object reference is kept for anything that is only patched), instead
 *    of clearing and rebuilding the whole list on every snapshot.
 */
@Injectable({ providedIn: 'root' })
export class ExamTableModel {

  applicationDate = signal<Date | null>(this.readSavedApplicationDate());
  studentUid = signal<string>(localStorage.getItem('studentUid') || "");

  loading = signal<boolean>(true);
  examGradeList = signal<NodeTableRow[]>([]);

  private organization_id = this.userPreferencesService.getCurrentOrganizationId();

  private examGradeMap = new Map<string, NodeTableRow>();
  private currentFilterKey: string | null = null;
  private topLevelUnsubscribe: (() => void) | null = null;

  // resolved materia names / users rarely change and are shared across many
  // rows, so caching them is a big part of what makes re-subscriptions fast
  private materiaNameCache = new Map<string, string | null>();
  private userCache = new Map<string, User>();

  private parameterGradesUnsubscribe = new Map<string, () => void>();
  private parameterGradesMap = new Map<string, Map<string, NodeTableRow>>();

  constructor(
    private userPreferencesService: UserPreferencesService,
    private userLoginService: UserLoginService,
    private businessService: BusinessService,
    private dateFormatService: DateFormatService,
  ) {
    this.subscribeExamGrades();
  }

  setApplicationDate(date: Date | null) {
    this.applicationDate.set(date);
    localStorage.setItem('applicationDate', date ? date.toISOString() : null);
    this.subscribeExamGrades();
  }

  setStudentUid(uid: string) {
    uid = uid || "";
    this.studentUid.set(uid);
    localStorage.setItem('studentUid', uid);
    this.subscribeExamGrades();
  }

  expandExamGrade(examGrade_id: string) {
    const node = this.examGradeMap.get(examGrade_id);
    if (!node || node.opened) return;
    node.opened = true;
    this.subscribeParameterGrades(examGrade_id, node);
    this.loadHomeworkGrades(node);
    this.publish();
  }

  collapseExamGrade(examGrade_id: string) {
    const node = this.examGradeMap.get(examGrade_id);
    if (node) {
      node.opened = false;
      node.children = [];
    }
    const unsubscribe = this.parameterGradesUnsubscribe.get(examGrade_id);
    if (unsubscribe) {
      unsubscribe();
      this.parameterGradesUnsubscribe.delete(examGrade_id);
    }
    this.parameterGradesMap.delete(examGrade_id);
    this.publish();
  }

  // ----- top-level examGrades -----

  private buildFilterKey(): string {
    const date = this.applicationDate();
    const dateId = date ? this.dateFormatService.getDayId(date) : null;
    return dateId + "|" + this.studentUid();
  }

  private subscribeExamGrades() {
    const filterKey = this.buildFilterKey();
    if (filterKey === this.currentFilterKey && this.topLevelUnsubscribe) {
      // same filters as the already-live query: keep the existing listener
      // and data, nothing to reload
      return;
    }
    this.currentFilterKey = filterKey;

    if (this.topLevelUnsubscribe) {
      this.topLevelUnsubscribe();
      this.topLevelUnsubscribe = null;
    }
    // a Firestore `where` clause can't be changed on a live query, so a
    // filter change needs a brand new one and a clean slate of rows
    Array.from(this.examGradeMap.keys()).forEach(examGrade_id => this.collapseExamGrade(examGrade_id));
    this.examGradeMap.clear();
    this.publish();

    let qry = db.collection("examGrades")
      .where("organization_id", "==", this.organization_id)
      .where("isDeleted", "==", false);

    const date = this.applicationDate();
    if (date) {
      qry = qry.where("applicationDay", "==", this.dateFormatService.getDayId(date));
    }

    const studentUid = this.studentUid();
    if (studentUid) {
      qry = qry.where("studentUids", "array-contains", studentUid);
    }

    if (!date && !studentUid) {
      qry = qry.orderBy("applicationDate", "desc");
      qry = qry.limit(1000);
    }

    this.loading.set(true);
    this.topLevelUnsubscribe = qry.onSnapshot(
      set => this.applyExamGradeChanges(set.docChanges()),
      reason => {
        console.log(reason);
        alert("Error loading exams grades:" + reason);
      }
    );
  }

  private applyExamGradeChanges(changes: any[]) {
    if (changes.length === 0) {
      this.loading.set(false);
      return;
    }

    const pending: Promise<void>[] = [];

    changes.forEach(change => {
      const examGrade_id = change.doc.id;

      if (change.type === 'removed') {
        this.examGradeMap.delete(examGrade_id);
        this.collapseExamGrade(examGrade_id);
        return;
      }

      const examGrade: ExamGrade = change.doc.data() as ExamGrade;
      const applicationDate: Date = (examGrade.applicationDate as any).toDate();

      const fields = {
        id: examGrade.id ?? examGrade_id,
        exam_id: examGrade.exam_id,
        applicationDate,
        materia_id: examGrade.materia_id,
        student_uid: examGrade.student_uid,
        title: examGrade.title,
        score: this.toFixed(examGrade.score, 1),
        isReleased: examGrade.isReleased,
        isCompleted: examGrade.isCompleted
      };

      let node = this.examGradeMap.get(examGrade_id);
      if (!node) {
        node = {
          obj: { ...fields, materia_name: null, students: [] },
          opened: false,
          children: [],
          nodeClass: "examGrade",
          isLeaf: false
        };
        this.examGradeMap.set(examGrade_id, node);
      } else {
        // patch in place: keeps the row's object reference (and its
        // `opened`/`children` state) stable for rows that didn't actually
        // change, instead of tearing down and redrawing everything
        Object.assign(node.obj, fields);
      }

      pending.push(this.hydrateMateriaName(node, examGrade.materia_id));
      pending.push(this.hydrateStudents(node, examGrade.studentUids || []));
    });

    Promise.all(pending).then(() => {
      this.loading.set(false);
      this.publish();
    });
  }

  private hydrateMateriaName(node: NodeTableRow, materia_id: string): Promise<void> {
    if (!materia_id) {
      node.obj['materia_name'] = null;
      return Promise.resolve();
    }
    if (this.materiaNameCache.has(materia_id)) {
      node.obj['materia_name'] = this.materiaNameCache.get(materia_id);
      return Promise.resolve();
    }
    return db.collection("materias").doc(materia_id).get().then(doc => {
      const name = doc.exists ? doc.data().materia_name : null;
      this.materiaNameCache.set(materia_id, name);
      node.obj['materia_name'] = name;
    });
  }

  private hydrateStudents(node: NodeTableRow, studentUids: string[]): Promise<void> {
    if (!studentUids.length) {
      node.obj['students'] = [];
      return Promise.resolve();
    }
    return Promise.all(studentUids.map(uid => this.resolveUser(uid))).then(users => {
      node.obj['students'] = users;
    });
  }

  private resolveUser(uid: string): Promise<User> {
    const cached = this.userCache.get(uid);
    if (cached) return Promise.resolve(cached);

    return this.businessService.getUser(uid).then(user => {
      const resolved: User = user
        ? { ...user, displayName: this.userLoginService.getDisplayNameForUser(user) }
        : { uid: "", email: "desconocido", displayName: "desconocido" };
      this.userCache.set(uid, resolved);
      return resolved;
    });
  }

  private publish() {
    const rows = Array.from(this.examGradeMap.values());
    rows.sort((a, b) => {
      if (this.dateFormatService.formatDate(a.obj["applicationDate"]) == this.dateFormatService.formatDate(b.obj["applicationDate"])) {
        if (a.obj["title"]) return a.obj["title"] > b.obj["title"] ? 1 : -1;
        if (a.obj["label"]) return a.obj["label"] > b.obj["label"] ? 1 : -1;
        return 0;
      }
      return a.obj["applicationDate"] < b.obj["applicationDate"] ? 1 : -1;
    });
    this.examGradeList.set(rows);
  }

  // ----- parameterGrade / homework children (loaded on expand) -----

  private subscribeParameterGrades(examGrade_id: string, node: NodeTableRow) {
    if (this.parameterGradesUnsubscribe.has(examGrade_id)) return;

    const pgMap = new Map<string, NodeTableRow>();
    this.parameterGradesMap.set(examGrade_id, pgMap);

    const qry = db.collection("examGrades/" + examGrade_id + "/parameterGrades")
      .where("isCurrentVersion", "==", true);

    const unsubscribe = qry.onSnapshot(set => {
      set.docChanges().forEach(change => {
        const parameterGrade_id = change.doc.id;

        if (change.type === 'removed') {
          pgMap.delete(parameterGrade_id);
          return;
        }

        const parameterGrade: ParameterGrade = change.doc.data() as ParameterGrade;
        const fields = {
          examGrade_id,
          parameterGrade_id: parameterGrade.id ?? parameterGrade_id,
          label: parameterGrade.label,
          score: this.toFixed(parameterGrade.score, 1),
          isCompleted: parameterGrade.isCompleted,
          idx: parameterGrade.idx
        };

        const existing = pgMap.get(parameterGrade_id);
        if (!existing) {
          pgMap.set(parameterGrade_id, { obj: fields, opened: false, children: [], nodeClass: "parameterGrade", isLeaf: true });
        } else {
          Object.assign(existing.obj, fields);
        }
      });

      const parameterNodes = Array.from(pgMap.values());
      parameterNodes.sort((a, b) => a.obj["label"] > b.obj["label"] ? 1 : -1);

      const homeworkNodes = node.children.filter(n => n.nodeClass === 'homeworkGrade');
      node.children = [...parameterNodes, ...homeworkNodes];

      this.publish();
    },
      reason => {
        alert("error reading exams:" + reason);
      });

    this.parameterGradesUnsubscribe.set(examGrade_id, unsubscribe);
  }

  private loadHomeworkGrades(node: NodeTableRow): Promise<void> {
    const materia_id = node.obj['materia_id'];
    const exam_id = node.obj['exam_id'];
    const students: User[] = node.obj['students'] as User[];

    return db.collection("materias/" + materia_id + "/exams/" + exam_id + "/homeworks")
      .get().then(homeworkSet => {
        const homeworks = homeworkSet.docs.map(d => {
          const data = d.data() as any;
          return { id: d.id, label: data.label ?? '', idx: data.idx ?? 0 };
        });
        homeworks.sort((a, b) => a.idx - b.idx);

        return Promise.all(homeworks.map(homework => {
          return Promise.all(students.map(student => {
            return db.collection("materiaEnrollments")
              .where("organization_id", "==", this.organization_id)
              .where("isDeleted", "==", false)
              .where("student_uid", "==", student.uid)
              .where("materia_id", "==", materia_id)
              .get().then(enrollSet => {
                if (enrollSet.empty) return 0;
                const enrollmentId = enrollSet.docs[0].id;
                return db.collection("materiaEnrollments").doc(enrollmentId)
                  .collection("homeworkScores").doc(homework.id).get().then(scoreDoc => {
                    return scoreDoc.exists ? (scoreDoc.data().homework_score ?? 0) : 0;
                  });
              });
          })).then((scores: number[]) => {
            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            return {
              obj: { label: homework.label, score: this.toFixed(avg, 1), idx: homework.idx, isCompleted: true },
              opened: false,
              children: [],
              nodeClass: "homeworkGrade",
              isLeaf: true
            } as NodeTableRow;
          });
        })).then(homeworkNodes => {
          homeworkNodes.sort((a, b) => a.obj['idx'] - b.obj['idx']);
          const otherNodes = node.children.filter(n => n.nodeClass !== 'homeworkGrade');
          node.children = [...otherNodes, ...homeworkNodes];
          this.publish();
        });
      });
  }

  // ----- misc -----

  private toFixed(num, fixed) {
    if (num == null) return null;
    num = Math.trunc(num * 100) / 100;
    return num.toFixed(fixed);
  }

  private readSavedApplicationDate(): Date | null {
    const saved = localStorage.getItem('applicationDate');
    if (!saved || saved == 'null') return null;
    try {
      return new Date(saved);
    } catch (e) {
      return null;
    }
  }
}
