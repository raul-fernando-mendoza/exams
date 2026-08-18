//
//  AspectGradeEntity.swift
//  thoth_exam_legacy
//

import CoreData

@objc(AspectGradeEntity)
public class AspectGradeEntity: NSManagedObject {}

extension AspectGradeEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<AspectGradeEntity> {
        NSFetchRequest<AspectGradeEntity>(entityName: "AspectGradeEntity")
    }

    @NSManaged public var id: String
    @NSManaged public var idx: Int32
    @NSManaged public var label: String?
    @NSManaged public var aspectDescription: String?
    @NSManaged public var isGraded: Bool
    @NSManaged public var score: Double
    @NSManaged public var hasMedal: Bool
    @NSManaged public var missingElements: String?
    @NSManaged public var criteriaGrade: CriteriaGradeEntity?
}
