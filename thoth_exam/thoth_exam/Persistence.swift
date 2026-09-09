//
//  Persistence.swift
//  thoth_exam
//

import CoreData

struct PersistenceController {
    static let shared = PersistenceController()

    static var preview: PersistenceController = {
        let result = PersistenceController(inMemory: true)
        let viewContext = result.container.viewContext

        let pg = ParameterGradeEntity(context: viewContext)
        pg.id = "preview-pg-1"
        pg.label = "Sample Parameter"
        pg.scoreType = "status"
        pg.score = 8.6
        pg.earnedPoints = 3.44
        pg.availablePoints = 4.0
        pg.isCompleted = false
        pg.evaluator_uid = "preview-uid"

        let cg = CriteriaGradeEntity(context: viewContext)
        cg.id = "preview-cg-1"
        cg.label = "Sample Criteria"
        cg.score = 8.6
        cg.earnedPoints = 3.44
        cg.availablePoints = 4.0
        pg.addToCriteriaGrades(cg)

        for i in 0..<4 {
            let ag = AspectGradeEntity(context: viewContext)
            ag.id = "preview-ag-\(i)"
            ag.idx = Int32(i)
            ag.label = "Aspect \(i + 1)"
            ag.score = 0.86
            cg.addToAspectGrades(ag)
        }

        try? viewContext.save()
        return result
    }()

    let container: NSPersistentContainer

    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "thoth_exam")
        if inMemory {
            container.persistentStoreDescriptions.first!.url = URL(fileURLWithPath: "/dev/null")
        }
        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        }
        container.viewContext.automaticallyMergesChangesFromParent = true
    }

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

    func fetchStudentDisplayNames() -> [String: String] {
        let request = StudentDisplayNameEntity.fetchRequest()
        guard let entities = try? container.viewContext.fetch(request) else { return [:] }
        return Dictionary(uniqueKeysWithValues: entities.map { ($0.uid, $0.displayName) })
    }

    func fetchEvaluators() -> [EvaluatorEntity] {
        let request = EvaluatorEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \EvaluatorEntity.displayName, ascending: true)]
        return (try? container.viewContext.fetch(request)) ?? []
    }

    func hasEvaluators() -> Bool {
        let request = EvaluatorEntity.fetchRequest()
        request.fetchLimit = 1
        return (try? container.viewContext.count(for: request)) ?? 0 > 0
    }
}
