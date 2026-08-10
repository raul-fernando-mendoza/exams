import SwiftUI

class AppState: ObservableObject {
    @Published var unlocked = false
    @Published var hasSelectedEvaluator = false
}
