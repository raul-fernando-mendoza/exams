import SwiftUI
import CoreData

struct ParameterGradeEditView: View {
    @ObservedObject var parameterGrade: ParameterGradeEntity
    @Environment(\.managedObjectContext) private var viewContext

    @State private var displayScore: Double
    @State private var studentNames: [String] = []
    @Environment(\.dismiss) private var dismiss

    init(parameterGrade: ParameterGradeEntity) {
        _parameterGrade = ObservedObject(wrappedValue: parameterGrade)
        _displayScore = State(initialValue: parameterGrade.score)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                headerCard

                ForEach(parameterGrade.sortedCriteriaGrades) { criteriaGrade in
                    CriteriaGradeView(
                        criteriaGrade: criteriaGrade,
                        scoreType: parameterGrade.scoreType ?? "status",
                        onScoreChanged: recalculateDisplayScore
                    )
                }

                commentSection

                submitButton
            }
            .padding(.vertical)
        }
        .navigationTitle(parameterGrade.label ?? "Parameter Grade")
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear { persistAndSave() }
        .onAppear { loadStudentNames() }
    }

    private var headerCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let label = parameterGrade.label {
                Text(label).font(.title2).bold()
            }
            if let title = parameterGrade.examGradeTitle {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            if !studentNames.isEmpty {
                Text(studentNames.joined(separator: ", "))
                    .font(.subheadline)
                    .foregroundColor(.primary)
            }
            if let desc = parameterGrade.paramDescription, !desc.isEmpty {
                Text(desc).font(.body).foregroundColor(.secondary)
            }
            Divider()
            HStack {
                VStack(alignment: .leading) {
                    Text("Score").font(.caption).foregroundColor(.secondary)
                    Text(String(format: "%.1f / 10", displayScore))
                        .font(.title3).bold()
                }
                Spacer()
                if parameterGrade.isCompleted {
                    Label("Completed", systemImage: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.subheadline)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }

    private var commentSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Evaluator Comment").font(.headline)
            TextEditor(text: Binding(
                get: { parameterGrade.evaluator_comment ?? "" },
                set: { parameterGrade.evaluator_comment = $0.isEmpty ? nil : $0 }
            ))
            .frame(minHeight: 80)
            .padding(4)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color(.systemGray4))
            )
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Done") {
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                }
            }
        }
        .padding(.horizontal)
    }

    private var submitButton: some View {
        Button(action: submit) {
            Label("Submit Grade", systemImage: "checkmark")
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor)
                .foregroundColor(.white)
                .cornerRadius(12)
        }
        .padding(.horizontal)
    }

    // Updates only @State — does NOT touch CoreData, so @FetchRequest is never triggered.
    private func recalculateDisplayScore() {
        let criteriaList = parameterGrade.sortedCriteriaGrades
        let earned = criteriaList.reduce(0.0) { $0 + $1.earnedPoints }
        let available = criteriaList.reduce(0.0) { $0 + $1.availablePoints }
        guard available > 0 else { return }
        displayScore = (earned / available * 10 * 10).rounded() / 10
    }

    // Writes accumulated changes to CoreData and saves — called only on submit or disappear.
    private func persistAndSave() {
        let criteriaList = parameterGrade.sortedCriteriaGrades
        let earned = criteriaList.reduce(0.0) { $0 + $1.earnedPoints }
        let available = criteriaList.reduce(0.0) { $0 + $1.availablePoints }
        parameterGrade.earnedPoints = earned
        parameterGrade.availablePoints = available
        if available > 0 {
            parameterGrade.score = (earned / available * 10 * 10).rounded() / 10
        }
        try? viewContext.save()
    }

    private func submit() {
        parameterGrade.isCompleted = true
        persistAndSave()

        // Silent API save - delete from CoreData if successful
        let pgToDelete = parameterGrade
        let context = viewContext
        Task {
            if let examGradeId = pgToDelete.examGradeId {
                do {
                    try await APIService.shared.saveParameterGrade(
                        examGradeId: examGradeId,
                        parameterGrade: pgToDelete
                    )
                    // Successfully uploaded - delete from CoreData
                    await MainActor.run {
                        context.delete(pgToDelete)
                        try? context.save()
                    }
                } catch {
                    // Silent fail - keep in CoreData for later retry
                }
            }
        }

        dismiss()
    }

    private func loadStudentNames() {
        let uids = parameterGrade.studentUidList
        guard !uids.isEmpty else { return }

        let allNames = PersistenceController.shared.fetchStudentDisplayNames()
        studentNames = uids.map { allNames[$0] ?? $0 }
    }
}
