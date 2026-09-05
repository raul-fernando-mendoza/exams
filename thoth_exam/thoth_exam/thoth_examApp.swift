//
//  thoth_examApp.swift
//  thoth_exam
//

import SwiftUI

@main
struct thoth_examApp: App {
    let persistenceController = PersistenceController.shared
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .environmentObject(appState)
                .dynamicTypeSize(.xxLarge)
                .onAppear {
                    appState.hasSelectedEvaluator = persistenceController.hasSelectedEvaluator()
                }
        }
    }
}
