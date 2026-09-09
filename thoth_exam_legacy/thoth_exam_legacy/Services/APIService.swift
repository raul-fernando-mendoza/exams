//
//  APIService.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible API service using completion handlers
//

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
        guard let orgId = Bundle.main.infoDictionary?["ORGANIZATION_ID"] as? String else {
            fatalError("ORGANIZATION_ID not found in Info.plist")
        }
        return orgId
    }()

    private init() {}

    // MARK: - Fetch Evaluators

    func fetchEvaluators(completion: @escaping (Result<[EvaluatorUser], Error>) -> Void) {
        guard let url = URL(string: "\(base)/userlist?claim=role-evaluador-\(organizationId)") else {
            completion(.failure(URLError(.badURL)))
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }

            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(URLError(.badServerResponse)))
                }
                return
            }

            do {
                let response = try JSONDecoder().decode(UserListResponse.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(response.userlist))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
        task.resume()
    }

    // MARK: - Fetch Parameter Grades

    func fetchParameterGrades(evaluatorId: String, completion: @escaping (Result<[ParameterGradeDTO], Error>) -> Void) {
        guard let encoded = evaluatorId.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(base)/examgradeslist?evaluator_id=\(encoded)") else {
            completion(.failure(URLError(.badURL)))
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }

            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(URLError(.badServerResponse)))
                }
                return
            }

            do {
                let response = try JSONDecoder().decode(ParameterGradesResponse.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(response.parameterGrades))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
        task.resume()
    }

    // MARK: - Fetch Student Display Name

    func fetchStudentDisplayName(uid: String, completion: @escaping (Result<String?, Error>) -> Void) {
        guard let encoded = uid.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(base)/studentdisplayname?student_uid=\(encoded)") else {
            completion(.failure(URLError(.badURL)))
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }

            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                DispatchQueue.main.async {
                    completion(.failure(URLError(.badServerResponse)))
                }
                return
            }

            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(URLError(.badServerResponse)))
                }
                return
            }

            struct DisplayNameResponse: Codable {
                let displayName: String?
            }

            do {
                let response = try JSONDecoder().decode(DisplayNameResponse.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(response.displayName))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
        task.resume()
    }

    // MARK: - Save Parameter Grade

    func saveParameterGrade(examGradeId: String, parameterGrade: ParameterGradeEntity, completion: @escaping (Result<Void, Error>) -> Void) {
        guard let url = URL(string: "\(base)/updateparametergrade") else {
            completion(.failure(URLError(.badURL)))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "examGrade_id": examGradeId,
            "parameterGrade": buildPayload(parameterGrade)
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            completion(.failure(error))
            return
        }

        let task = URLSession.shared.dataTask(with: request) { _, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }

            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                DispatchQueue.main.async {
                    completion(.failure(URLError(.badServerResponse)))
                }
                return
            }

            DispatchQueue.main.async {
                completion(.success(()))
            }
        }
        task.resume()
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
