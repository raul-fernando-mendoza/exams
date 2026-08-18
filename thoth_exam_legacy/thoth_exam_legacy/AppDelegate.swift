//
//  AppDelegate.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible app delegate with programmatic UI setup
//

import UIKit
import CoreData

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        window = UIWindow(frame: UIScreen.main.bounds)

        let rootViewController: UIViewController

        if PersistenceController.shared.hasSelectedEvaluator() {
            // Show main grades list
            let gradesVC = GradesListViewController()
            rootViewController = UINavigationController(rootViewController: gradesVC)
        } else {
            // Show evaluator selection
            let evaluatorVC = EvaluatorSelectionViewController()
            rootViewController = UINavigationController(rootViewController: evaluatorVC)
        }

        window?.rootViewController = rootViewController
        window?.makeKeyAndVisible()

        return true
    }

    func applicationWillTerminate(_ application: UIApplication) {
        PersistenceController.shared.saveContext()
    }

    // MARK: - Navigation Helpers

    func switchToGradesList() {
        let gradesVC = GradesListViewController()
        let navController = UINavigationController(rootViewController: gradesVC)

        UIView.transition(with: window!, duration: 0.3, options: .transitionCrossDissolve, animations: {
            self.window?.rootViewController = navController
        }, completion: nil)
    }

    func switchToEvaluatorSelection() {
        let evaluatorVC = EvaluatorSelectionViewController()
        let navController = UINavigationController(rootViewController: evaluatorVC)

        UIView.transition(with: window!, duration: 0.3, options: .transitionCrossDissolve, animations: {
            self.window?.rootViewController = navController
        }, completion: nil)
    }
}
