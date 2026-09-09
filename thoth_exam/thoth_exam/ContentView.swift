//
//  ContentView.swift
//  thoth_exam
//

import SwiftUI
import CoreData

struct ContentView: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.managedObjectContext) private var viewContext

    @FetchRequest(
        sortDescriptors: [
            NSSortDescriptor(keyPath: \ParameterGradeEntity.examGradeTitle, ascending: false),
            NSSortDescriptor(keyPath: \ParameterGradeEntity.label, ascending: true)
        ],
        animation: .default
    ) private var parameterGrades: FetchedResults<ParameterGradeEntity>

    @State private var showSettings = false
    @State private var showPinForSettings = false
    @State private var studentNames: [String: String] = [:]
    @State private var selectedEvaluatorUid: String = ""
    @State private var selectedEvaluatorName: String = "Grades"

    private var sortedParameterGrades: [ParameterGradeEntity] {
        parameterGrades
            .filter { !$0.isCompleted && $0.evaluator_uid == selectedEvaluatorUid }
            .sorted { ($0.examGradeTitle ?? "") < ($1.examGradeTitle ?? "") }
    }

    private func refreshSelectedEvaluator() {
        if let evaluator = PersistenceController.shared.fetchSelectedEvaluator() {
            selectedEvaluatorUid = evaluator.uid
            selectedEvaluatorName = evaluator.displayName ?? "Grades"
        } else {
            selectedEvaluatorUid = ""
            selectedEvaluatorName = "Grades"
        }
    }

    var body: some View {
        mainContent
    }

    private var mainContent: some View {
        NavigationView {
            VStack(spacing: 0) {
                if sortedParameterGrades.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.circle")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)
                        Text("No hay mas examenes pendientes por calificar.")
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxHeight: .infinity)
                    .padding()
                } else {
                    List(sortedParameterGrades) { pg in
                        NavigationLink(destination: ParameterGradeEditView(parameterGrade: pg)) {
                            ParameterGradeRow(
                                parameterGrade: pg,
                                studentNames: pg.studentUidList.map { studentNames[$0] ?? $0 }
                            )
                        }
                    }
                }

            }
            .navigationTitle(selectedEvaluatorName)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showPinForSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
            }
            .fullScreenCover(isPresented: $showPinForSettings) {
                PinEntryView(
                    onUnlocked: {
                        showPinForSettings = false
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            showSettings = true
                        }
                    },
                    onFailed: {
                        showPinForSettings = false
                    }
                )
            }
            .sheet(isPresented: $showSettings, onDismiss: {
                refreshSelectedEvaluator()
                studentNames = PersistenceController.shared.fetchStudentDisplayNames()
            }) {
                SettingsView {
                    // Reset callback - currently unused
                }
            }
            .onAppear {
                refreshSelectedEvaluator()
                studentNames = PersistenceController.shared.fetchStudentDisplayNames()
                if selectedEvaluatorUid.isEmpty {
                    showSettings = true
                }
            }
        }
    }
}

struct ParameterGradeRow: View {
    @ObservedObject var parameterGrade: ParameterGradeEntity
    let studentNames: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {

                Text(parameterGrade.label ?? "Parameter \(parameterGrade.idx)")
                    .font(.headline)
                Spacer()
                if parameterGrade.isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
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
        }
        .padding(.vertical, 4)
    }
}
/*
 #Preview {
 ContentView()
 .environmentObject(AppState())
 .environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
 }
 */
