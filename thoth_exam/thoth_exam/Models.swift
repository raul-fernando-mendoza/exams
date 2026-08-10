import Foundation

struct UserListResponse: Codable {
    let userlist: [EvaluatorUser]
}

struct EvaluatorUser: Codable, Identifiable {
    let uid: String
    let email: String?
    let displayName: String?
    var id: String { uid }
}

struct ParameterGradesResponse: Codable {
    let parameterGrades: [ParameterGradeDTO]
}

struct ParameterGradeDTO: Codable, Identifiable {
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
    var studentUids: [String]?
    var criteriaGrades: [CriteriaGradeDTO]?
}

struct CriteriaGradeDTO: Codable, Identifiable {
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

struct AspectGradeDTO: Codable, Identifiable {
    var id: String
    var idx: Int?
    var label: String?
    var description: String?
    var isGraded: Bool?
    var score: Double?
    var hasMedal: Bool?
    var missingElements: String?
}
