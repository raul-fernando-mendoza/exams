import CoreData

@objc(ParameterGradeEntity)
public class ParameterGradeEntity: NSManagedObject {}

extension ParameterGradeEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<ParameterGradeEntity> {
        NSFetchRequest<ParameterGradeEntity>(entityName: "ParameterGradeEntity")
    }

    @NSManaged public var id: String
    @NSManaged public var examGradeId: String?
    @NSManaged public var organization_id: String?
    @NSManaged public var idx: Int32
    @NSManaged public var label: String?
    @NSManaged public var paramDescription: String?
    @NSManaged public var scoreType: String?
    @NSManaged public var score: Double
    @NSManaged public var earnedPoints: Double
    @NSManaged public var availablePoints: Double
    @NSManaged public var evaluator_uid: String?
    @NSManaged public var applicationDay: Int32
    @NSManaged public var isCompleted: Bool
    @NSManaged public var evaluator_comment: String?
    @NSManaged public var examGradeTitle: String?
    @NSManaged public var studentUids: String?
    @NSManaged public var criteriaGrades: NSSet?

    var studentUidList: [String] {
        guard let uids = studentUids, !uids.isEmpty else { return [] }
        return uids.components(separatedBy: ",")
    }

    var sortedCriteriaGrades: [CriteriaGradeEntity] {
        let set = criteriaGrades as? Set<CriteriaGradeEntity> ?? []
        return set.sorted { $0.idx < $1.idx }
    }
}

extension ParameterGradeEntity {
    @objc(addCriteriaGradesObject:)
    @NSManaged public func addToCriteriaGrades(_ value: CriteriaGradeEntity)

    @objc(removeCriteriaGradesObject:)
    @NSManaged public func removeFromCriteriaGrades(_ value: CriteriaGradeEntity)

    @objc(addCriteriaGrades:)
    @NSManaged public func addToCriteriaGrades(_ values: NSSet)

    @objc(removeCriteriaGrades:)
    @NSManaged public func removeFromCriteriaGrades(_ values: NSSet)
}

extension ParameterGradeEntity: Identifiable {}
