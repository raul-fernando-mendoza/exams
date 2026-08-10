import SwiftUI
import CoreData

struct SettingsView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss

    @State private var showWarning = false
    @State private var showPinEntry = false

    let onResetComplete: () -> Void

    var body: some View {
        NavigationView {
            List {
                Section {
                    Button(role: .destructive) {
                        showWarning = true
                    } label: {
                        Label("Reset All Data", systemImage: "trash")
                    }
                } footer: {
                    Text("This will delete all stored grades and return to evaluator selection.")
                }
            }
            .navigationTitle("Settings")
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
                    showPinEntry = true
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("All data will be erased. You will need to select an evaluator and reload grades from the server.")
            }
            .fullScreenCover(isPresented: $showPinEntry) {
                PinEntryView(
                    onUnlocked: {
                        deleteAllData()
                        showPinEntry = false
                        dismiss()
                        onResetComplete()
                    },
                    onFailed: {
                        showPinEntry = false
                    }
                )
            }
        }
    }

    private func deleteAllData() {
        for entity in ["AspectGradeEntity", "CriteriaGradeEntity", "ParameterGradeEntity", "StudentDisplayNameEntity", "SelectedEvaluatorEntity"] {
            let request = NSFetchRequest<NSFetchRequestResult>(entityName: entity)
            let delete = NSBatchDeleteRequest(fetchRequest: request)
            _ = try? viewContext.execute(delete)
        }
        viewContext.reset()
    }
}
