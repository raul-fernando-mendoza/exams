//
//  ContentView.swift
//  thoth_exam
//

import SwiftUI
import CoreData

private struct SaveResultAlert: Identifiable {
    let id = UUID()
    let title: String
    let message: String
}

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
    @State private var studentNames: [String: String] = [:]
    @State private var isSaving = false
    @State private var saveProgress: (current: Int, total: Int) = (0, 0)
    @State private var saveResult: SaveResultAlert?

    private var selectedEvaluator: SelectedEvaluatorEntity? {
        PersistenceController.shared.fetchSelectedEvaluator()
    }
    
    private var sortedParameterGrades: [ParameterGradeEntity] {
        parameterGrades.sorted { ($0.examGradeTitle ?? "") < ($1.examGradeTitle ?? "") }
    }

    var body: some View {
        Group {
            if !appState.hasSelectedEvaluator {
                firstLaunchFlow
            } else {
                mainContent
            }
        }
    }

    private var firstLaunchFlow: some View {
        Group {
            if !appState.unlocked {
                PinEntryView {
                    appState.unlocked = true
                }
            } else {
                EvaluatorSelectionView {
                    appState.hasSelectedEvaluator = true
                    studentNames = PersistenceController.shared.fetchStudentDisplayNames()
                }
            }
        }
    }

    private var mainContent: some View {
        NavigationView {
            VStack(spacing: 0) {
                if parameterGrades.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "tray")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)
                        Text("No parameter grades found")
                    }
                    .frame(maxHeight: .infinity)
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

                if !parameterGrades.isEmpty {
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
                                .background(isSaving || saveResult != nil ? Color.gray : Color.accentColor)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                        .disabled(isSaving || saveResult != nil)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                }
            }
            .navigationTitle(selectedEvaluator?.displayName ?? "Grades")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
            }
            .sheet(isPresented: $showSettings) {
                SettingsView {
                    appState.hasSelectedEvaluator = false
                    appState.unlocked = false
                }
            }
            .alert(item: $saveResult) { result in
                Alert(
                    title: Text(result.title),
                    message: Text(result.message),
                    dismissButton: .default(Text("OK"))
                )
            }
            .onAppear {
                studentNames = PersistenceController.shared.fetchStudentDisplayNames()
            }
        }
    }

    private func saveAllGrades() async {
        let grades = parameterGrades.filter { $0.examGradeId != nil }
        guard !grades.isEmpty else {
            saveResult = SaveResultAlert(
                title: "Nothing to save",
                message: parameterGrades.isEmpty
                    ? "No grades are stored on this device."
                    : "Stored grades are missing server reference."
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
            HStack {
                Text(parameterGrade.scoreType ?? "")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
        .environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
}
