//
//  Models.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible DTOs for API communication
//

import Foundation

struct UserListResponse: Codable {
    let userlist: [EvaluatorUser]
}

struct EvaluatorUser: Codable {
    let uid: String
    let email: String?
    let displayName: String?
}

struct ParameterGradesResponse: Codable {
    let parameterGrades: [ParameterGradeDTO]
}

struct ParameterGradeDTO: Codable {
    var id: String
    var organization_id: String?
    var idx: Int?
    var label: String?
    var description: String?
    var scoreType: String?
    var score: Double?
    var earnedPoints: Double?
    var availablePoints: Double?
    var examGrade_id: String?
    var evaluator_uid: String?
    var applicationDay: Int?
    var isCompleted: Bool?
    var evaluator_comment: String?
    var examGradeTitle: String?
    var expression: String?
    var materiaName: String?
    var level: String?
    var studentUids: [String]?
    var criteriaGrades: [CriteriaGradeDTO]?
}

struct CriteriaGradeDTO: Codable {
    var id: String
    var idx: Int?
    var label: String?
    var description: String?
    var isSelected: Bool?
    var score: Double?
    var earnedPoints: Double?
    var availablePoints: Double?
    var aspectGrades: [AspectGradeDTO]?
}

struct AspectGradeDTO: Codable {
    var id: String
    var idx: Int?
    var label: String?
    var description: String?
    var isGraded: Bool?
    var score: Double?
    var hasMedal: Bool?
    var missingElements: String?
}
