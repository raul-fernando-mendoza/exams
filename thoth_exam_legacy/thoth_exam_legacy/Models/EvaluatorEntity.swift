//
//  EvaluatorEntity.swift
//  thoth_exam_legacy
//

import CoreData

@objc(EvaluatorEntity)
public class EvaluatorEntity: NSManagedObject {}

extension EvaluatorEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<EvaluatorEntity> {
        NSFetchRequest<EvaluatorEntity>(entityName: "EvaluatorEntity")
    }

    @NSManaged public var uid: String
    @NSManaged public var email: String?
    @NSManaged public var displayName: String?
}
