import { Injectable } from '@angular/core';
import { db } from 'src/environments/environment';
import { Homework } from './exams/exams.module';
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class HomeworkService {

  private collection(materiaId: string, examId: string) {
    return db.collection('materias/' + materiaId + '/exams/' + examId + '/homeworks')
  }

  addHomework(materiaId: string, examId: string, homework: Omit<Homework, 'id'>): Promise<void> {
    const id = uuid.v4()
    const doc: Homework = { ...homework, id }
    return this.collection(materiaId, examId).doc(id).set(doc).then(() => {
      console.log('homework added:', id)
    }, reason => {
      alert('ERROR: adding homework: ' + reason)
    })
  }

  updateHomework(materiaId: string, examId: string, homework: Homework): Promise<void> {
    const { id, ...fields } = homework
    return this.collection(materiaId, examId).doc(id).update(fields).then(() => {
      console.log('homework updated:', id)
    }, reason => {
      alert('ERROR: updating homework: ' + reason)
    })
  }

  deleteHomework(materiaId: string, examId: string, homeworkId: string): Promise<void> {
    return this.collection(materiaId, examId).doc(homeworkId).delete().then(() => {
      console.log('homework deleted:', homeworkId)
    }, reason => {
      alert('ERROR: deleting homework: ' + reason)
    })
  }
}
