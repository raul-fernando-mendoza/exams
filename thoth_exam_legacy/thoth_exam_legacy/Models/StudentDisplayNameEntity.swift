//
//  StudentDisplayNameEntity.swift
//  thoth_exam_legacy
//

import CoreData

@objc(StudentDisplayNameEntity)
public class StudentDisplayNameEntity: NSManagedObject {}

extension StudentDisplayNameEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<StudentDisplayNameEntity> {
        NSFetchRequest<StudentDisplayNameEntity>(entityName: "StudentDisplayNameEntity")
    }

    @NSManaged public var uid: String
    @NSManaged public var displayName: String
}
