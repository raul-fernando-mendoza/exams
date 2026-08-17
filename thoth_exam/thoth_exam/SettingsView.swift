import SwiftUI
import CoreData

private struct SaveResultAlert: Identifiable {
    let id = UUID()
    let title: String
    let message: String
}

struct SettingsView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss

    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \ParameterGradeEntity.label, ascending: true)],
        animation: .default
    ) private var parameterGrades: FetchedResults<ParameterGradeEntity>

    @State private var showWarning = false
    @State private var isSaving = false
    @State private var saveProgress: (current: Int, total: Int) = (0, 0)
    @State private var saveResult: SaveResultAlert?

    // Evaluator selection states
    @State private var evaluators: [EvaluatorEntity] = []
    @State private var isLoadingGrades = false
    @State private var loadProgress: String = ""
    @State private var loadError: String?
    @State private var selectedEvaluatorUid: String = ""

    let onResetComplete: () -> Void

    private var completedGrades: [ParameterGradeEntity] {
        parameterGrades.filter { $0.isCompleted && $0.examGradeId != nil }
    }

    private var hasCompletedGrades: Bool {
        !completedGrades.isEmpty
    }

    private var gradesByEvaluator: [(evaluatorUid: String, evaluatorName: String, grades: [ParameterGradeEntity])] {
        let grouped = Dictionary(grouping: parameterGrades) { $0.evaluator_uid ?? "" }
        return grouped
            .filter { !$0.key.isEmpty && !$0.value.isEmpty }
            .map { (uid, grades) in
                let name = evaluators.first(where: { $0.uid == uid })?.displayName ?? uid
                return (evaluatorUid: uid, evaluatorName: name, grades: grades.sorted { ($0.examGradeTitle ?? "") < ($1.examGradeTitle ?? "") })
            }
            .sorted { $0.evaluatorName < $1.evaluatorName }
    }

    var body: some View {
        NavigationView {
            List {
                // Evaluators with their parameter grades
                ForEach(gradesByEvaluator, id: \.evaluatorUid) { evaluatorGroup in
                    Section {
                        ForEach(evaluatorGroup.grades) { grade in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(grade.label ?? "Unknown")
                                        .font(.subheadline)
                                    if let title = grade.examGradeTitle {
                                        Text(title)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                Spacer()
                                if grade.isCompleted {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.green)
                                } else {
                                    Image(systemName: "circle")
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    } header: {
                        HStack {
                            Image(systemName: "person.fill")
                            Text(evaluatorGroup.evaluatorName)
                        }
                    }
                }

                Section {
                    if hasCompletedGrades {
                        VStack(spacing: 8) {
                            if isSaving {
                                HStack(spacing: 8) {
                                    ProgressView()
                                    Text("Saving \(saveProgress.current) of \(saveProgress.total)...")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                            }
                            Button {
                                Task { await saveAllGrades() }
                            } label: {
                                Label("Sincronizar", systemImage: "icloud.and.arrow.up")
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(isSaving ? Color.gray : Color.accentColor)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            .disabled(isSaving)
                            .buttonStyle(PlainButtonStyle())
                        }
                    } else {
                        Text("No hay ningun examen terminado por enviar.")
                            .foregroundColor(.secondary)
                    }
                } footer: {
                    if hasCompletedGrades {
                        Text("Upload \(completedGrades.count) completed grade(s) to the server.")
                    }
                }

                Section {
                    Button(role: .destructive) {
                        showWarning = true
                    } label: {
                        Label("Reset All Data", systemImage: "trash")
                    }
                } footer: {
                    Text("This will delete all stored grades and return to evaluator selection.")
                }

                Section {
                    if isLoadingGrades {
                        HStack {
                            ProgressView()
                            Text(loadProgress)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    } else if let error = loadError {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(error)
                                .foregroundColor(.red)
                            Button("Retry") {
                                Task { await loadAllEvaluatorData() }
                            }
                        }
                    } else if evaluators.isEmpty {
                        Text("No evaluators loaded. Use Reset All Data to load from server.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(evaluators) { evaluator in
                            Button {
                                selectEvaluator(evaluator)
                            } label: {
                                HStack {
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
                                    Spacer()
                                    if selectedEvaluatorUid == evaluator.uid {
                                        Image(systemName: "checkmark")
                                            .foregroundColor(.accentColor)
                                    }
                                }
                            }
                        }
                    }
                } header: {
                    Text("Change Evaluator")
                } footer: {
                    Text("Select a different evaluator to grade exams.")
                }
            }
            .navigationTitle("Settings")
            .task {
                selectedEvaluatorUid = PersistenceController.shared.fetchSelectedEvaluator()?.uid ?? ""
                evaluators = PersistenceController.shared.fetchEvaluators()
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .confirmationDialog(
                "Reset All Data?",
                isPresented: $showWarning,
                titleVisibility: .visible
            ) {
                Button("Reset", role: .destructive) {
                    deleteAllData()
                    Task { await loadAllEvaluatorData() }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                if hasCompletedGrades {
                    Text("Las calificaciones que no han sido sincronizadas se perderan. ¿Esta seguro de continuar?")
                } else {
                    Text("All data will be erased. You will need to select an evaluator and reload grades from the server.")
                }
            }
            .alert(item: $saveResult) { result in
                Alert(
                    title: Text(result.title),
                    message: Text(result.message),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }

    private func saveAllGrades() async {
        let grades = completedGrades
        guard !grades.isEmpty else {
            saveResult = SaveResultAlert(
                title: "Nothing to save",
                message: "No completed grades to synchronize."
            )
            return
        }

        isSaving = true
        saveResult = nil
        saveProgress = (0, grades.count)

        var failed: [String] = []
        var succeeded: [ParameterGradeEntity] = []
        for pg in grades {
            do {
                try await APIService.shared.saveParameterGrade(
                    examGradeId: pg.examGradeId!,
                    parameterGrade: pg
                )
                succeeded.append(pg)
            } catch {
                failed.append(pg.label ?? pg.id)
            }
            saveProgress.current += 1
        }

        // Delete successfully uploaded grades from CoreData
        if !succeeded.isEmpty {
            await MainActor.run {
                for pg in succeeded {
                    viewContext.delete(pg)
                }
                try? viewContext.save()
            }
        }

        isSaving = false
        if failed.isEmpty {
            saveResult = SaveResultAlert(
                title: "Saved",
                message: "All \(grades.count) grade(s) were saved and removed from device."
            )
        } else {
            saveResult = SaveResultAlert(
                title: "Save failed",
                message: "Could not save: \(failed.joined(separator: ", "))"
            )
        }
    }

    private func deleteAllData() {
        // Only delete grades and student names, preserve evaluators and selected evaluator
        for entity in ["AspectGradeEntity", "CriteriaGradeEntity", "ParameterGradeEntity", "StudentDisplayNameEntity"] {
            let request = NSFetchRequest<NSFetchRequestResult>(entityName: entity)
            let delete = NSBatchDeleteRequest(fetchRequest: request)
            _ = try? viewContext.execute(delete)
        }
        viewContext.reset()
    }

    private func loadAllEvaluatorData() async {
        await MainActor.run {
            isLoadingGrades = true
            loadError = nil
            loadProgress = "Loading evaluators..."
        }

        do {
            // Fetch evaluators from API
            let apiEvaluators = try await APIService.shared.fetchEvaluators()

            // Save evaluators to CoreData
            await MainActor.run {
                saveEvaluatorsToCore(apiEvaluators)
                evaluators = PersistenceController.shared.fetchEvaluators()
            }

            var allGrades: [(EvaluatorUser, [ParameterGradeDTO])] = []
            var allStudentUids: Set<String> = []

            // Load grades for each evaluator
            for (index, evaluator) in apiEvaluators.enumerated() {
                await MainActor.run {
                    loadProgress = "Loading grades for evaluator \(index + 1)/\(apiEvaluators.count)..."
                }
                let dtos = try await APIService.shared.fetchParameterGrades(evaluatorId: evaluator.uid)
                allGrades.append((evaluator, dtos))

                // Collect student UIDs
                for dto in dtos {
                    if let uids = dto.studentUids {
                        allStudentUids.formUnion(uids)
                    }
                }
            }

            // Load all student names
            let totalStudents = allStudentUids.count
            var studentNamesResult: [(String, String)] = []

            for (index, uid) in allStudentUids.enumerated() {
                await MainActor.run {
                    loadProgress = "Loading student names (\(index + 1)/\(totalStudents))..."
                }
                if let name = try? await APIService.shared.fetchStudentDisplayName(uid: uid) {
                    studentNamesResult.append((uid, name))
                }
            }

            let studentNames = Dictionary(studentNamesResult, uniquingKeysWith: { _, last in last })

            // Save all data to CoreData
            await MainActor.run {
                loadProgress = "Saving data..."
                for (evaluator, grades) in allGrades {
                    saveEvaluatorData(evaluator: evaluator, grades: grades, studentNames: studentNames)
                }
                isLoadingGrades = false
            }
        } catch {
            await MainActor.run {
                isLoadingGrades = false
                loadError = "Failed to load data: \(error.localizedDescription)"
            }
        }
    }

    private func saveEvaluatorsToCore(_ apiEvaluators: [EvaluatorUser]) {
        // Delete existing evaluators
        let request = NSFetchRequest<NSFetchRequestResult>(entityName: "EvaluatorEntity")
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: request)
        _ = try? viewContext.execute(deleteRequest)

        // Save new evaluators
        for apiEval in apiEvaluators {
            let entity = EvaluatorEntity(context: viewContext)
            entity.uid = apiEval.uid
            entity.email = apiEval.email
            entity.displayName = apiEval.displayName
        }
        try? viewContext.save()
    }

    private func selectEvaluator(_ evaluator: EvaluatorEntity) {
        // Delete existing selected evaluator
        let request = NSFetchRequest<NSFetchRequestResult>(entityName: "SelectedEvaluatorEntity")
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: request)
        _ = try? viewContext.execute(deleteRequest)

        // Create new selected evaluator
        let selectedEvaluatorEntity = SelectedEvaluatorEntity(context: viewContext)
        selectedEvaluatorEntity.uid = evaluator.uid
        selectedEvaluatorEntity.email = evaluator.email
        selectedEvaluatorEntity.displayName = evaluator.displayName

        try? viewContext.save()
        selectedEvaluatorUid = evaluator.uid
    }

    private func saveEvaluatorData(evaluator: EvaluatorUser, grades: [ParameterGradeDTO], studentNames: [String: String]) {
        // Get existing student UIDs to avoid duplicates
        let existingStudents = PersistenceController.shared.fetchStudentDisplayNames()

        for (uid, name) in studentNames {
            if existingStudents[uid] == nil {
                let entity = StudentDisplayNameEntity(context: viewContext)
                entity.uid = uid
                entity.displayName = name
            }
        }

        // Get existing parameter grade IDs to avoid duplicates
        let existingGradeIds = Set(parameterGrades.map { $0.id })

        for dto in grades {
            // Skip if this grade already exists
            if existingGradeIds.contains(dto.id) {
                continue
            }

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
            pg.expression = dto.expression
            pg.materiaName = dto.materiaName
            pg.level = dto.level
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
