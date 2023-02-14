import { PackageRepr } from "../service-layer/PackageRepr";
import { ServiceRepr } from "../service-layer/ServiceRepr";
import { ApiServiceImpl } from "./ApiServiceImpl";

export const RUNTIME_PACKAGE_NAME = "@open-pioneer/runtime";

/**
 * Creates the builtin package containing the builtin services.
 *
 * The runtime package should not use services in the `build.config.mjs`
 * for a clean bootstrapping procedure (it will be instantiated without
 * generated application metadata in tests).
 *
 * This function is called as part of the service layer startup.
 * The package produced here is always part of the application.
 */
export function createBuiltinPackage(): PackageRepr {
    return new PackageRepr({
        name: RUNTIME_PACKAGE_NAME,
        services: [
            new ServiceRepr({
                name: "ApiServiceImpl",
                packageName: RUNTIME_PACKAGE_NAME,
                clazz: ApiServiceImpl,
                interfaces: [
                    {
                        interfaceName: "runtime.ApiService",
                        qualifier: "builtin"
                    }
                ],
                dependencies: [
                    {
                        referenceName: "providers",
                        interfaceName: "runtime.ApiExtension",
                        all: true
                    }
                ]
            })
        ]
    });
}
