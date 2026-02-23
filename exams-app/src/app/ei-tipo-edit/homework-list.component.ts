import { Component, OnInit, signal, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HomeworkService } from '../homework.service';
import { Homework } from 'src/app/exams/exams.module';
import { MatDialog } from '@angular/material/dialog';
import { DialogNameDialog } from '../name-dialog/name-dlg';
import { db } from 'src/environments/environment';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

interface HomeworkItem {
  homework: Homework
  fg: FormGroup
}

@Component({
  selector: 'app-homework-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatToolbarModule,
  ],
  templateUrl: './homework-list.component.html',
  styleUrls: ['./homework-list.component.css']
})
export class HomeworkListComponent implements OnInit, OnDestroy {
  @Input() materia_id: string
  @Input() exam_id: string

  submitting = signal(false)
  homeworks = signal<Array<HomeworkItem> | null>(null)
  unsubscribe: () => void

  constructor(
    private fb: FormBuilder,
    private homeworkService: HomeworkService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.update()
  }

  ngOnDestroy(): void {
    this.unsubscribe()
  }

  update() {
    this.unsubscribe = db.collection('materias/' + this.materia_id + '/exams/' + this.exam_id + '/homeworks').onSnapshot(
      set => {
        let newHomeworks = new Array<HomeworkItem>()
        set.docs.forEach(h => {
          let newHomework = h.data() as Homework
          let newfg = this.fb.group({
            id: [newHomework['id']],
            label: [newHomework['label']],
            idx: [newHomework['idx']],
          })
          newHomeworks.push({ homework: newHomework, fg: newfg })
        })
        newHomeworks.sort((a, b) => a.homework.idx > b.homework.idx ? 1 : -1)
        this.homeworks.set(newHomeworks)
      },
      onError => console.log('Error:' + onError)
    )
  }

  delHomework(p: FormGroup) {
    if (!confirm('Esta seguro de querer borrar la tarea')) return
    this.submitting.set(true)
    this.homeworkService.deleteHomework(this.materia_id, this.exam_id, p.controls['id'].value)
      .then(() => this.submitting.set(false))
      .catch(error => { alert('tarea no pudo ser borrada:' + error); this.submitting.set(false) })
  }

  onChangeHomework(p: FormGroup) {
    if (p.invalid) return
    const homework: Homework = {
      id: p.controls['id'].value,
      label: p.controls['label'].value,
      idx: p.controls['idx'].value,
    }
    this.homeworkService.updateHomework(this.materia_id, this.exam_id, homework)
  }

  onNewHomework() {
    const dialogRef = this.dialog.open(DialogNameDialog, {
      height: '400px',
      width: '250px',
      data: { label: 'Tarea', name: '' }
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) this.newHomework(data.name)
    })
  }

  newHomework(label: string) {
    this.homeworkService.addHomework(this.materia_id, this.exam_id, {
      idx: this.homeworks().length,
      label: label,
    })
  }
}
