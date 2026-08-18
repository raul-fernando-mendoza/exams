//
//  PersistenceController.swift
//  thoth_exam_legacy
//
//  iOS 12 compatible Core Data stack
//

import CoreData

class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentContainer

    var viewContext: NSManagedObjectContext {
        return container.viewContext
    }

    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "thoth_exam_legacy")
        if inMemory {
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }
        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        }
        container.viewContext.automaticallyMergesChangesFromParent = true
    }

    // MARK: - Evaluator Queries

    func hasSelectedEvaluator() -> Bool {
        let request = SelectedEvaluatorEntity.fetchRequest()
        request.fetchLimit = 1
        return (try? container.viewContext.count(for: request)) ?? 0 > 0
    }

    func fetchSelectedEvaluator() -> SelectedEvaluatorEntity? {
        let request = SelectedEvaluatorEntity.fetchRequest()
        request.fetchLimit = 1
        return try? container.viewContext.fetch(request).first
    }

    func fetchEvaluators() -> [EvaluatorEntity] {
        let request = EvaluatorEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(key: "displayName", ascending: true)]
        return (try? container.viewContext.fetch(request)) ?? []
    }

    func hasEvaluators() -> Bool {
        let request = EvaluatorEntity.fetchRequest()
        request.fetchLimit = 1
        return (try? container.viewContext.count(for: request)) ?? 0 > 0
    }

    // MARK: - Student Name Queries

    func fetchStudentDisplayNames() -> [String: String] {
        let request = StudentDisplayNameEntity.fetchRequest()
        guard let entities = try? container.viewContext.fetch(request) else { return [:] }
        return Dictionary(uniqueKeysWithValues: entities.map { ($0.uid, $0.displayName) })
    }

    // MARK: - Grade Queries

    func fetchParameterGrades(for evaluatorUid: String, includeCompleted: Bool = false) -> [ParameterGradeEntity] {
        let request = ParameterGradeEntity.fetchRequest()
        var predicates = [NSPredicate(format: "evaluator_uid == %@", evaluatorUid)]
        if !includeCompleted {
            predicates.append(NSPredicate(format: "isCompleted == NO"))
        }
        request.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        request.sortDescriptors = [
            NSSortDescriptor(key: "examGradeTitle", ascending: true),
            NSSortDescriptor(key: "label", ascending: true)
        ]
        return (try? container.viewContext.fetch(request)) ?? []
    }

    func fetchAllParameterGrades() -> [ParameterGradeEntity] {
        let request = ParameterGradeEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(key: "label", ascending: true)]
        return (try? container.viewContext.fetch(request)) ?? []
    }

    func fetchCompletedGrades() -> [ParameterGradeEntity] {
        let request = ParameterGradeEntity.fetchRequest()
        request.predicate = NSPredicate(format: "isCompleted == YES AND examGradeId != nil")
        return (try? container.viewContext.fetch(request)) ?? []
    }

    // MARK: - Save Context

    func saveContext() {
        let context = container.viewContext
        if context.hasChanges {
            try? context.save()
        }
    }

    // MARK: - Delete All Data

    func deleteAllData() {
        let entities = ["AspectGradeEntity", "CriteriaGradeEntity", "ParameterGradeEntity",
                        "StudentDisplayNameEntity", "EvaluatorEntity", "SelectedEvaluatorEntity"]
        for entity in entities {
            let request = NSFetchRequest<NSFetchRequestResult>(entityName: entity)
            let deleteRequest = NSBatchDeleteRequest(fetchRequest: request)
            _ = try? container.viewContext.execute(deleteRequest)
        }
        container.viewContext.reset()
    }
}
