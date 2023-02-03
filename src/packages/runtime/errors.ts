export enum ErrorId {
    INVALID_METADATA = "runtime:invalid-metadata",
    PROPERTY_RESOLUTION_FAILED = "runtime:property-resolution-failed",
    INVALID_PROPERTY_NAME = "runtime:invalid-property-name",
    REQUIRED_PROPERTY = "runtime:required-property",

    // Service layer
    INTERFACE_NOT_FOUND = "runtime:interface-not-found",
    UNDECLARED_DEPENDENCY = "runtime:undeclared-dependency",
    SERVICE_CONSTRUCTION_FAILED = "runtime:service-construction-failed",
    SERVICE_DESTRUCTION_FAILED = "runtime:service-destruction-failed",
    DUPLICATE_INTERFACE = "runtime:duplicate-interface",
    DEPENDENCY_CYCLE = "runtime:dependency-cycle",

    // Internal
    INTERNAL = "runtime:internal-error"
}
