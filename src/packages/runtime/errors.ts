export enum ErrorId {
    // Problems with application metadata
    INVALID_METADATA = "runtime:invalid-metadata",
    PROPERTY_RESOLUTION_FAILED = "runtime:property-resolution-failed",
    INVALID_PROPERTY_NAME = "runtime:invalid-property-name",
    REQUIRED_PROPERTY = "runtime:required-property",

    // Application lifecycle
    NOT_MOUNTED = "runtime:element-not-mounted",

    // Service layer
    INTERFACE_NOT_FOUND = "runtime:interface-not-found",
    AMBIGUOUS_DEPENDENCY = "runtime:ambiguous-dependency",
    UNDECLARED_DEPENDENCY = "runtime:undeclared-dependency",
    SERVICE_CONSTRUCTION_FAILED = "runtime:service-construction-failed",
    SERVICE_DESTRUCTION_FAILED = "runtime:service-destruction-failed",
    DUPLICATE_INTERFACE = "runtime:duplicate-interface",
    DEPENDENCY_CYCLE = "runtime:dependency-cycle",

    // Web component API
    DUPLICATE_API_METHODS = "runtime:duplicate-api-methods",

    // Internal
    INTERNAL = "runtime:internal-error"
}
