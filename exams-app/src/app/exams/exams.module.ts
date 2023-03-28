import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup } from '@angular/forms';

import * as uuid from 'uuid';
import { MatMonthView } from '@angular/material/datepicker';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ExamsModule { }

export function copyObj( to:{}, from:{} ) {
  var result = {}
  for(const i in Object.keys(to)){
    const key = Object.keys(to)[i]

    if( key in from ){
      if( 
         typeof from[key] == "string" ||
         typeof from[key] == "number" ||         
         typeof from[key] == "boolean" ||
         (from[key] instanceof Date) ||        
         Array.isArray(from[key]) && from[key].every(i => (typeof i === "string"))
        ){
          result[key] = from[key]
          to[key] = from[key]
      }
      else if( from[key]!= null && "seconds" in from[key]  ){
        result[key] = new Date(from[key].toDate())
        to[key] = new Date(from[key].toDate())
      }
    }
  }
  return result
}

export function copyFromForm(to:{}, from:UntypedFormGroup) {
  var result = {}
  for(const i in Object.keys(to)){
    const key = Object.keys(to)[i]

    if( key in from.controls ){
      if( 
         typeof from.controls[key].value == "string" ||
         typeof from.controls[key].value == "number" ||         
         typeof from.controls[key].value == "boolean" ||
         (from.controls[key].value instanceof Date) ||
         Array.isArray(from.controls[key].value) && from.controls[key].value.every(i => (typeof i === "string"))
      ){
          result[key] = from.controls[key].value
          to[key] = from.controls[key].value
      }      
    }
  }
  return result
}

export interface User{
  uid:string 
  email?:string 
  displayName?:string
  claims?:{}
}

export interface Aspect{
  id:string
  idx?:number
  label?:string
  description?:string
}
export interface Criteria{
  id:string
  idx?:number  
  label?:string
  description?:string
  initiallySelected?:boolean
  aspects?: Aspect[]
}
export interface Parameter{
  id:string 
  idx?:number
  label?:string
  scoreType?:string
  description?:string
  criterias?: Criteria[]

  
}
export interface Exam{
  id:string 
  label?:string 
  description?:string 
  isRequired?:boolean 
  isDeleted?:boolean 

  parameters?: Parameter[] 
}

export interface Laboratory{
  id:string 
  label?:string 
  description?:string 
  isRequired?:boolean 
  isDeleted?:boolean 
  videoPath?:string
  videoUrl?:string
  soundPath?:string
  soundUrl?:string  
}

export interface Materia{

  id:string 
  organization_id?:string
  materia_name?:string 
  isDeleted?:boolean 

  certificateTypeId?:string
  materiaIconPath?:string
  materiaIconUrl?:string
    

  description?:string 
  pictureUrl?:string
  picturePath?:string
  pictureDescription?:string
  videoUrl?:string 
  videoPath?:string
  videoDescription?:string
  isEnrollmentActive?:boolean 

  label1?:string 
  label2?:string 
  label3?:string 
  label4?:string 
  color1?:string 
  color2?:string 
  

  exams?:Exam[]

}
export interface MateriaRequest{
  materias:Materia
}



export const GROUP_GRADES_TYPES = [
  { id:0, description:"Todas Requeridas"},
  { id:1, description:"1 requerida"},
  { id:2, description:"2 requeridas"},
  { id:3, description:"3 requeridas"},
  { id:4, description:"4 requeridas"},
]

export interface Group{
  id:string
  group_name?:string
  isDeleted?:false
  group_grade_type_id?:number
}

export interface Level{
  id:string
  level_name?:string
  isDeleted?:boolean
}

export interface Career{
  organization_id?:string

  id:string
  career_name?:string
  iconUrl?:string
  iconPath?:string
  description?:string
  pictureUrl?:string
  picturePath?:string
  pictureDescription?:string
  videoUrl?:string
  videoPath?:string
  videoDescription?:string
  isDeleted?:boolean
}

export interface MateriaEnrollment{
  organization_id?:string
  id:string
  materia_id?:string
  materia?:Materia
  student_uid?:string
  student?:User
  isDeleted?:boolean
  certificateUrl?:string
  certificatePath?:string
  certificateBadgeUrl?:string
}

export interface ExamRequest{
  materias:{
    id:string
    exams:Exam
  }
}

export interface ExamMultipleRequest{
  exams:Exam[]
  orderBy?:{
    field:string
    direction?:string
    startAfterId?:string
    pageSize?:string
  }
}
export interface ParameterRequest{
  materias:{
    id:string
    exams:{
      id:string
      parameters:Parameter
    }
  }
}

export interface CriteriaRequest{
  materias:{
    id:string,
    exams:{
      id:string,
      parameters:{
        id:string
        criterias:Criteria
      }
    }
  }
}

export interface AspectRequest{
  materias:{
    id:string,
    exams:{
      id:string,
      parameters:{      
        id: string, 
        criterias:{  
          id:string
          aspects:Aspect
        }
      }
    }
  }
}

export interface AspectGrade{
  id:string
  idx?:number  
  label?: string 
  description?:string 
  isGraded?:boolean 
  score?:number
  hasMedal?:boolean
  missingElements?:string 
}

export interface CriteriaGrade{
  id:string 
  idx?:number 
  label?: string 
  description?: string 
  isSelected?:boolean 
  score?:number 
  aspectGrades?: AspectGrade[] 
}

export type ScoreType =  "starts" | "status"

export interface ParameterGrade{
  id:string 
  organization_id?:string  
  idx?: number 
  label?: string 
  description?:string 
  scoreType?:ScoreType 
  score?:number 
  evaluator_uid?:string 
  evaluator?:User
  applicationDate?:Date
  applicationDay?:number
  applicationMonth?: number
  applicationYear?:number

  isCompleted?:boolean 
  evaluator_comment?:string
  commentSoundPath?:string
  commentSoundUrl?:string

  criteriaGrades?: CriteriaGrade[] 
}


export interface ExamGrade{
  id?:string 
  organization_id?:string

  exam_id?:string
  exam?:Exam

  materia_id?:string 
  materia?:Materia;

  isCompleted?: boolean 
  applicationDate?:Date
  applicationDay?:number
  applicationMonth?:number
  applicationYear?:number

  student_uid?:string 
  student?:User

  title?:string 
  expression?:string 
  level?:string

  score?:number 

  isDeleted?:boolean 
  isReleased?:boolean 
  isApproved?:boolean 
  parameterGrades?:ParameterGrade[] 

  isWaiver?:boolean

  evaluators?:Array<string>

  created_on?:Date
  updated_on?:Date
}

export enum LaboratoryGradeStatus { initial , requestGrade , rework , accepted }
export function getLaboratoryStatusName( status:LaboratoryGradeStatus ):string{
  var statusName:string = ""
  switch( status ){
    case LaboratoryGradeStatus.initial: statusName = "Pending"
      break
    case LaboratoryGradeStatus.accepted: statusName = "Approvado"
      break
    case LaboratoryGradeStatus.requestGrade: statusName = "Enviado"
      break
    case LaboratoryGradeStatus.rework: statusName = "Retrabajo"
      break
  }
  return statusName
}

export interface LaboratoryGrade{
  id?:string 
  organization_id?:string

  laboratory_id?:string
  laboratory?:Laboratory

  materia_id?:string 
  materia?:Materia;

  status:LaboratoryGradeStatus
  applicationDate?:Date 

  student_uid?:string 
  student?:User

  laboratory_name?:string 


  score?:number 

  isWaiver?:boolean

  createdDay?:number
  createdMonth?:number
  createdYear?:number
  requestedDay?:number
  requestedMonth?:number
  requestedYear?:number

}
export interface LaboratoryGradeStudentData{
  videoPath?:string
  videoUrl?:string  
}

export interface AspectGradeRequest{
  examGrades:{
    id:string,
    parameterGrades:{
      id:string,
      criteriaGrades:{
        id:string,
        aspectGrades:AspectGrade
      }
    }
  }
}
export interface CriteriaGradeRequest{
  examGrades:{
    id:string,
    parameterGrades:{
      id:string,
      criteriaGrades:CriteriaGrade      
    }
  }  
  
}
export interface ParameterGradeRequest{
  examGrades:{
    id:string,
    parameterGrades:ParameterGrade
  }
}
export interface ExamGradeRequest{
  examGrades:ExamGrade
}

export interface ExamGradeMultipleRequest{
  examGrades:ExamGrade[]
  orderBy?:{
    field:string
    direction?:string
    startAfterId?:string
    pageSize?:string
  }
}



export interface Organization{
  id:string
  organization_name?:string
  isDeleted?:boolean
  isDefaultOrganization?:string
}

export interface OrganizationRequest{
  materia:Organization
}
export interface OrganizationMultipleRequest{
  materia:Organization[]
  orderBy?:{
    field:string
    direction?:string
    startAfterId?:string
    pageSize?:string
  }
}

export interface CareerAdvance{
  id:string
  organization_id:string
  career_id:string
  student_uid:string
  career_materias_required:number
  career_materias_approved:number
  career_completed:boolean

}

export interface GroupGrade{
  id:string
  group_materias_required:number
  group_materias_approved:number
  group_completed:boolean
}

export interface CertificateType{
  id:string
  certificateTypeName?:string
  certificateTypeUrl?:string
  certificateTypePath?:string
  label1?:string
  label2?:string
  label3?:string
  label4?:string
  color1?:string
  color2?:string
}

export interface Reference{
  id:string
  label:string
  desc:string
  fileUrl:string
  filePath:string
}

export enum RevisionStatus { requested , completed }
export const RevisionStatusNames=["pendiente" , "revisado"]  
export interface Revision{
  id:string
  organization_id?:string
  label?:string
  student_uid?:string
  date?:Date
  dateId?:number
  status?:RevisionStatus
  isDeleted?:boolean
}

export interface MarkerPoint{
  x:number
  y:number
  color:string
}

export interface MarkerPath{
  id:string
  points:MarkerPoint[]
}


export interface Marker{
  id:string
  loopDuration?:number
  startTime?:number //seconds float
  commentPath?:string
  commentUrl?:string
  playbackRate?:number
}

export interface VideoMarker{
  id:string
  videoUrl?:string
  videoPath?:string  
  isDeleted:boolean
}
