import SwiftUI
import CoreData

struct EvaluatorSelectionView: View {
    @Environment(\.managedObjectContext) private var viewContext

    @State private var evaluators: [EvaluatorUser] = []
    @State private var isLoadingEvaluators = false
    @State private var errorMessage: String?
    @State private var isLoadingGrades = false
    @State private var loadProgress: String = ""

    let onComplete: () -> Void

    var body: some View {
        NavigationView {
            Group {
                if isLoadingEvaluators {
                    ProgressView("Loading evaluators...")
                } else if isLoadingGrades {
                    VStack(spacing: 16) {
                        ProgressView()
                        Text(loadProgress)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else if let error = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.orange)
                        Text(error)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task { await loadEvaluators() }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    List(evaluators) { evaluator in
                        Button {
                            Task { await selectEvaluator(evaluator) }
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(evaluator.displayName ?? "Unknown")
                                    .font(.headline)
                                    .foregroundColor(.primary)
                                if let email = evaluator.email {
                                    Text(email)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationTitle("Select Evaluator")
            .task { await loadEvaluators() }
        }
    }

    private func loadEvaluators() async {
        isLoadingEvaluators = true
        errorMessage = nil
        do {
            evaluators = try await APIService.shared.fetchEvaluators()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoadingEvaluators = false
    }

    private func selectEvaluator(_ evaluator: EvaluatorUser) async {
        await MainActor.run {
            isLoadingGrades = true
            loadProgress = "Loading grades..."
            errorMessage = nil
        }

        do {
            // Fetch parameter grades
            let dtos = try await APIService.shared.fetchParameterGrades(evaluatorId: evaluator.uid)

            // Collect all unique student UIDs
            let allStudentUids = Array(Set(dtos.flatMap { $0.studentUids ?? [] }))
            let totalCount = allStudentUids.count

            await MainActor.run {
                loadProgress = "Loading student names (0/\(totalCount))..."
            }

            // Fetch all student display names sequentially
            var studentNamesResult: [(String, String)] = []
            for (index, uid) in allStudentUids.enumerated() {
                if let name = try? await APIService.shared.fetchStudentDisplayName(uid: uid) {
                    studentNamesResult.append((uid, name))
                }
                let currentCount = index + 1
                await MainActor.run {
                    loadProgress = "Loading student names (\(currentCount)/\(totalCount))..."
                }
            }

            let studentNames = Dictionary(uniqueKeysWithValues: studentNamesResult)

            await MainActor.run {
                loadProgress = "Saving data..."
            }

            // Save everything to CoreData
            await MainActor.run {
                saveAllData(evaluator: evaluator, grades: dtos, studentNames: studentNames)
                isLoadingGrades = false
                onComplete()
            }
        } catch {
            await MainActor.run {
                isLoadingGrades = false
                errorMessage = "Failed to load grades: \(error.localizedDescription)"
            }
        }
    }

    private func saveAllData(evaluator: EvaluatorUser, grades: [ParameterGradeDTO], studentNames: [String: String]) {
        // Save selected evaluator
        let selectedEvaluator = SelectedEvaluatorEntity(context: viewContext)
        selectedEvaluator.uid = evaluator.uid
        selectedEvaluator.email = evaluator.email
        selectedEvaluator.displayName = evaluator.displayName

        // Save student display names
        for (uid, name) in studentNames {
            let entity = StudentDisplayNameEntity(context: viewContext)
            entity.uid = uid
            entity.displayName = name
        }

        // Save parameter grades
        for dto in grades {
            let pg = ParameterGradeEntity(context: viewContext)
            pg.id = dto.id
            pg.examGradeId = dto.examGrade_id
            pg.organization_id = dto.organization_id
            pg.idx = Int32(dto.idx ?? 0)
            pg.label = dto.label
            pg.paramDescription = dto.description
            pg.scoreType = dto.scoreType
            pg.score = dto.score ?? 0
            pg.earnedPoints = dto.earnedPoints ?? 0
            pg.availablePoints = dto.availablePoints ?? 0
            pg.evaluator_uid = dto.evaluator_uid ?? evaluator.uid
            pg.applicationDay = Int32(dto.applicationDay ?? 0)
            pg.isCompleted = dto.isCompleted ?? false
            pg.evaluator_comment = dto.evaluator_comment
            pg.examGradeTitle = dto.examGradeTitle
            pg.studentUids = dto.studentUids?.joined(separator: ",")

            for cgDTO in dto.criteriaGrades ?? [] {
                let cg = CriteriaGradeEntity(context: viewContext)
                cg.id = cgDTO.id
                cg.idx = Int32(cgDTO.idx ?? 0)
                cg.label = cgDTO.label
                cg.criteriaDescription = cgDTO.description
                cg.isSelected = cgDTO.isSelected ?? false
                cg.score = cgDTO.score ?? 0
                cg.earnedPoints = cgDTO.earnedPoints ?? 0
                cg.availablePoints = cgDTO.availablePoints ?? 0

                for agDTO in cgDTO.aspectGrades ?? [] {
                    let ag = AspectGradeEntity(context: viewContext)
                    ag.id = agDTO.id
                    ag.idx = Int32(agDTO.idx ?? 0)
                    ag.label = agDTO.label
                    ag.aspectDescription = agDTO.description
                    ag.isGraded = agDTO.isGraded ?? false
                    ag.score = agDTO.score ?? 0
                    ag.hasMedal = agDTO.hasMedal ?? false
                    ag.missingElements = agDTO.missingElements
                    cg.addToAspectGrades(ag)
                }
                pg.addToCriteriaGrades(cg)
            }
        }

        try? viewContext.save()
    }
}
