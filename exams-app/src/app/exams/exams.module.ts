import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ExamsModule { }



export interface User{
  uid:string
  email:string
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
  materia_id?:string

  id:string
  label?:string
  description?:string
  owners?:Array<string>
  isDeleted?:boolean

  parameters?: Parameter[]

  required_in_carrers_ids?:Array<string>
}

export interface Materia{
  group_id?:string

  id:string
  materia_name?:string
  isDeleted?:boolean
  owners?:Array<string>

  typeCertificate?:string
  iconCertificate?:string

}

export interface Group{
  nivel_id?: string

  id:string
  group_name?:string
  owners?:Array<string>
  isDeleted?:false

  evaluation_type?:number
}

export interface Nivel{
  organization_id?:string

  id:string
  nivel_name?:string
  owners?:Array<string>
  isDeleted?:boolean
}

export interface Career{
  organization_id?:string

  id:string
  career_name?:string
  isDeleted?:boolean
  owners?:Array<string>
}


export interface ExamRequest{
  exams:Exam
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
  exams:{
    id:string
    parameters:Parameter
  }
}

export interface CriteriaRequest{
  exams:{
    id:string,
    parameters:{
      id:string
      criterias:Criteria
    }
  }
}

export interface AspectRequest{
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

export interface AspectGrade{
  id:string
  idx?:number  
  label?: string
  description?:string
  isGraded?:boolean
  score?:number
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

export interface ParameterGrade{
  id: string
  idx?: number
  label?: string
  description?:string
  type?:string
  scoreType?: string
  score?:number
  evaluator_uid?:string
  evaluator_name?:string
  evaluator_email?:string
  evaluator_comment?:string

  completed?:boolean
  

  criteriaGrades?: CriteriaGrade[] 
}


export interface ExamGrade{
  id: string

  exam_id?:string
  exam_label?:string

  materia_id?:string

  exam_typeCertificate?:string
  exam_iconCertificate?:string

  completed?: boolean
  applicationDate?:Date

  student_uid?:string
  student_email?:string
  student_name?:string

  title?:string
  expression?:string

  score?:number
  certificate_url?:string

  released?:boolean
  isDeleted?:boolean

  exams?:Exam

  parameterGrades?:ParameterGrade[]
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

export interface TypeCertificate{
  value: string
  label: string
}

export interface Organization{
  id:string
  organization_name?:string
  isDeleted?:boolean
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
