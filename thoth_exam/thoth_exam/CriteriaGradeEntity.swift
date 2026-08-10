import CoreData

@objc(CriteriaGradeEntity)
public class CriteriaGradeEntity: NSManagedObject {}

extension CriteriaGradeEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<CriteriaGradeEntity> {
        NSFetchRequest<CriteriaGradeEntity>(entityName: "CriteriaGradeEntity")
    }

    @NSManaged public var id: String
    @NSManaged public var idx: Int32
    @NSManaged public var label: String?
    @NSManaged public var criteriaDescription: String?
    @NSManaged public var isSelected: Bool
    @NSManaged public var score: Double
    @NSManaged public var earnedPoints: Double
    @NSManaged public var availablePoints: Double
    @NSManaged public var parameterGrade: ParameterGradeEntity?
    @NSManaged public var aspectGrades: NSSet?

    var sortedAspectGrades: [AspectGradeEntity] {
        let set = aspectGrades as? Set<AspectGradeEntity> ?? []
        return set.sorted { $0.idx < $1.idx }
    }
}

extension CriteriaGradeEntity {
    @objc(addAspectGradesObject:)
    @NSManaged public func addToAspectGrades(_ value: AspectGradeEntity)

    @objc(removeAspectGradesObject:)
    @NSManaged public func removeFromAspectGrades(_ value: AspectGradeEntity)

    @objc(addAspectGrades:)
    @NSManaged public func addToAspectGrades(_ values: NSSet)

    @objc(removeAspectGrades:)
    @NSManaged public func removeFromAspectGrades(_ values: NSSet)
}

extension CriteriaGradeEntity: Identifiable {}
