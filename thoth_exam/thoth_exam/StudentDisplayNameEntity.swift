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

extension StudentDisplayNameEntity: Identifiable {
    public var id: String { uid }
}
