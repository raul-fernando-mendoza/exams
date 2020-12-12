import { Question } from './Questions';
import { User } from './user';

export class Exam{
    id:number;
    label:string;
    studentName:string;
    teacherName:string;
    grade:number;
    completed:boolean;
    applicationDate:string;
}