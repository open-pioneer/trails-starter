import { Service } from "@open-pioneer/runtime";
import {
    PackageContext as InternalPackageContext,
    PackageContextMethods
} from "@open-pioneer/runtime/react-integration";
import { FC, ReactNode, useMemo } from "react";

export type AnyService = Service<Record<string, unknown>>;

export interface PackageContextProviderProps {
    /** Interface implementations, keyed by interface name. */
    services?: {
        [interfaceName: string]: AnyService;
    };

    /** Interface implementations, keyed by interface name and then by qualifier. */
    qualifiedServices?: {
        [interfaceName: string]: {
            [qualifier: string]: AnyService;
        };
    };

    /** Package properties (keyed by package name). */
    properties?: {
        [packageName: string]: Record<string, unknown>;
    };

    /** Children to render */
    children?: ReactNode;
}

/**
 * Injects services and properties into the component tree.
 * React components using pioneer hooks like `useService` and `useProperties`
 * will receive the mocked properties here instead.
 */
export const PackageContextProvider: FC<PackageContextProviderProps> = (props) => {
    const { services, qualifiedServices, properties, children } = props;
    const contextMethods = useMemo(
        () => createPackageContextMethods({ services, qualifiedServices, properties }),
        [services, qualifiedServices, properties]
    );
    return (
        <InternalPackageContext.Provider value={contextMethods}>
            {children}
        </InternalPackageContext.Provider>
    );
};

function createPackageContextMethods(
    options: Omit<PackageContextProviderProps, "children">
): PackageContextMethods {
    const services = options?.services ?? {};
    const qualifiedServices = options?.qualifiedServices ?? {};
    const properties = options?.properties ?? {};
    return {
        getService(packageName, interfaceName, options) {
            if (!options.qualifier) {
                const service = services[interfaceName];
                if (service) {
                    return service;
                }
                const qualified = qualifiedServices[interfaceName];
                if (qualified) {
                    for (const value of Object.values(qualified)) {
                        return value; // Return any implementation
                    }
                }
                throw new Error(
                    `Interface name not bound for testing: '${interfaceName}'. Update the configuration of PackageContextProvider.`
                );
            }

            const qualifiedService = qualifiedServices[interfaceName]?.[options.qualifier];
            if (!qualifiedService) {
                throw new Error(
                    `Interface name not bound for testing: '${interfaceName}' (qualifier '${options.qualifier}'). Update the configuration of PackageContextProvider.`
                );
            }
            return qualifiedService;
        },
        getServices(packageName, interfaceName) {
            const unqualified = services[interfaceName];
            const results = Object.values(qualifiedServices[interfaceName] ?? {});
            if (unqualified) {
                results.push(unqualified);
            }
            return results;
        },
        getProperties(packageName) {
            const packageProperties = properties[packageName];
            if (!packageProperties) {
                throw new Error(
                    `No properties for package '${packageName}' bound for testing. Update the configuration of PackageContextProvider.`
                );
            }
            return packageProperties;
        },
        getIntl(packageName) {
            // TODO
            throw new Error(`No i18n messages for package '${packageName}' bound for testing.`);
        }
    };
}
