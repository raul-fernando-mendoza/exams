//
//  SelectedEvaluatorEntity.swift
//  thoth_exam_legacy
//

import CoreData

@objc(SelectedEvaluatorEntity)
public class SelectedEvaluatorEntity: NSManagedObject {}

extension SelectedEvaluatorEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<SelectedEvaluatorEntity> {
        NSFetchRequest<SelectedEvaluatorEntity>(entityName: "SelectedEvaluatorEntity")
    }

    @NSManaged public var uid: String
    @NSManaged public var email: String?
    @NSManaged public var displayName: String?
}
