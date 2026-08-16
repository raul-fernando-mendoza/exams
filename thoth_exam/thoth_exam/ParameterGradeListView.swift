import SwiftUI
import CoreData

// Note: This view is no longer used - functionality has been merged into ContentView
struct ParameterGradeListView: View {
    let evaluator: EvaluatorUser

    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    @FetchRequest private var parameterGrades: FetchedResults<ParameterGradeEntity>

    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showPinForBack = false
    @State private var studentNames: [String: String] = [:]

    private var sortedParameterGrades: [ParameterGradeEntity] {
        parameterGrades.sorted { ($0.examGradeTitle ?? "") > ($1.examGradeTitle ?? "") }
    }

    init(evaluator: EvaluatorUser) {
        self.evaluator = evaluator
        
        _parameterGrades = FetchRequest(
            sortDescriptors: [
                NSSortDescriptor(keyPath: \ParameterGradeEntity.examGradeTitle, ascending: false),
                NSSortDescriptor(keyPath: \ParameterGradeEntity.label, ascending: false)
            ],
            predicate: NSPredicate(format: "evaluator_uid == %@", evaluator.uid),
            animation: .default
        )
         
    }

    var body: some View {
        Group {
            if isLoading {
                ProgressView("Loading grades...")
            } else if let error = errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.orange)
                    Text(error).multilineTextAlignment(.center)
                    Button("Retry") { Task { await fetchFromAPI() } }
                        .buttonStyle(.borderedProminent)
                }
                .padding()
            } else if parameterGrades.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "tray")
                        .font(.largeTitle)
                        .foregroundColor(.secondary)
                    Text("No parameter grades found")
                }
            } else {
                Text("HOLA")
                /*
                List(sortedParameterGrades) { pg in
                    
                        Text("examGradeTitle: \(pg.examGradeTitle ?? "nil")")
                    
                }
                 */
                /*
                List(sortedParameterGrades) { pg in
                    NavigationLink(destination: ParameterGradeEditView(parameterGrade: pg)) {
                        ParameterGradeRow(
                            parameterGrade: pg,
                            studentNames: pg.studentUidList.map { studentNames[$0] ?? $0 }
                        )
                    }
                }
                */
                .refreshable { await fetchFromAPI() }
                .onAppear {
                    for pg in sortedParameterGrades {
                        print("examGradeTitle: \(pg.examGradeTitle ?? "nil")")
                    }
                }
            }
        }
        .navigationTitle(evaluator.displayName ?? "Grades")
        .navigationBarTitleDisplayMode(.large)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    showPinForBack = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Evaluators")
                    }
                }
            }
        }
        .task { await loadGradesIfNeeded() }
        .task(id: parameterGrades.map(\.studentUids).description) {
            await loadStudentNames()
        }
        .fullScreenCover(isPresented: $showPinForBack) {
            PinEntryView(
                onUnlocked: {
                    showPinForBack = false
                    dismiss()
                },
                onFailed: {
                    showPinForBack = false
                }
            )
        }
    }

    private func loadStudentNames() async {
        let uids = Set(parameterGrades.flatMap(\.studentUidList))
            .filter { studentNames[$0] == nil }
        guard !uids.isEmpty else { return }

        var fetched: [String: String] = [:]
        await withTaskGroup(of: (String, String?).self) { group in
            for uid in uids {
                group.addTask {
                    let name = try? await APIService.shared.fetchStudentDisplayName(uid: uid)
                    return (uid, name)
                }
            }
            for await (uid, name) in group {
                if let name { fetched[uid] = name }
            }
        }
        await MainActor.run {
            studentNames.merge(fetched) { _, new in new }
        }
    }

    private func loadGradesIfNeeded() async {
        guard parameterGrades.isEmpty else { return }
        await fetchFromAPI()
    }

    private func fetchFromAPI() async {
        isLoading = true
        errorMessage = nil
        do {
            let dtos = try await APIService.shared.fetchParameterGrades(evaluatorId: evaluator.uid)
            await MainActor.run { saveParameterGrades(dtos) }
        } catch {
            await MainActor.run { errorMessage = error.localizedDescription }
        }
        await MainActor.run { isLoading = false }
    }

    private func saveParameterGrades(_ dtos: [ParameterGradeDTO]) {
        for pg in parameterGrades { viewContext.delete(pg) }

        for dto in dtos {
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
