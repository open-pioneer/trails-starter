export enum ErrorId {
    INVALID_METADATA = "runtime:invalid-metadata",
    INTERFACE_NOT_FOUND = "runtime:interface-not-found",
    SERVICE_CONSTRUCTION_FAILED = "runtime:service-construction-failed",
    SERVICE_DESTRUCTION_FAILED = "runtime:service-destruction-failed",
    DUPLICATE_INTERFACE = "runtime:duplicate-interface",
    DEPENDENCY_CYCLE = "runtime:dependency-cycle",

    INTERNAL = "runtime:internal-error"
}
