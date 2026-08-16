import Foundation

class APIService {
    static let shared = APIService()
    private let base: String = {
        guard let url = Bundle.main.infoDictionary?["BASE_URL"] as? String else {
            fatalError("BASE_URL not found in Info.plist")
        }
        return url
    }()
    
    private let organizationId: String = {
        guard let url = Bundle.main.infoDictionary?["ORGANIZATION_ID"] as? String else {
            fatalError("BASE_URL not found in Info.plist")
        }
        return url
    }()

    func fetchEvaluators() async throws -> [EvaluatorUser] {
        let url = URL(string: "\(base)/userlist?claim=role-evaluador-\(organizationId)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(UserListResponse.self, from: data).userlist
    }

    func fetchParameterGrades(evaluatorId: String) async throws -> [ParameterGradeDTO] {
        guard let encoded = evaluatorId.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(base)/examgradeslist?evaluator_id=\(encoded)") else {
            throw URLError(.badURL)
        }
        let (data, _) = try await URLSession.shared.data(from: url)
        let parameterGrades = try JSONDecoder().decode(ParameterGradesResponse.self, from: data).parameterGrades
        return parameterGrades
    }

    func fetchStudentDisplayName(uid: String) async throws -> String? {
        guard let encoded = uid.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(base)/studentdisplayname?student_uid=\(encoded)") else {
            throw URLError(.badURL)
        }
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        struct DisplayNameResponse: Codable {
            let displayName: String?
        }
        return try JSONDecoder().decode(DisplayNameResponse.self, from: data).displayName
    }

    func saveParameterGrade(examGradeId: String, parameterGrade: ParameterGradeEntity) async throws {
        let url = URL(string: "\(base)/updateparametergrade")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "examGrade_id": examGradeId,
            "parameterGrade": buildPayload(parameterGrade)
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }

    private func buildPayload(_ pg: ParameterGradeEntity) -> [String: Any] {
        var payload: [String: Any] = [
            "id": pg.id,
            "score": pg.score,
            "earnedPoints": pg.earnedPoints,
            "availablePoints": pg.availablePoints,
            "isCompleted": pg.isCompleted
        ]
        if let comment = pg.evaluator_comment {
            payload["evaluator_comment"] = comment
        }
        if let uid = pg.evaluator_uid {
            payload["evaluator_uid"] = uid
        }

        var criteriaList: [[String: Any]] = []
        for cg in pg.sortedCriteriaGrades {
            var cgDict: [String: Any] = [
                "id": cg.id,
                "score": cg.score,
                "earnedPoints": cg.earnedPoints,
                "availablePoints": cg.availablePoints,
                "isSelected": cg.isSelected
            ]

            var aspectList: [[String: Any]] = []
            for ag in cg.sortedAspectGrades {
                aspectList.append([
                    "id": ag.id,
                    "score": ag.score,
                    "isGraded": ag.isGraded,
                    "hasMedal": ag.hasMedal
                ])
            }
            cgDict["aspectGrades"] = aspectList
            criteriaList.append(cgDict)
        }
        payload["criteriaGrades"] = criteriaList
        return payload
    }
}
