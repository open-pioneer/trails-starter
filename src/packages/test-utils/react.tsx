import { Service } from "@open-pioneer/runtime";
import {
    PackageContext as InternalPackageContext,
    PackageContextMethods
} from "@open-pioneer/runtime/react-integration";
import { FC, ReactNode, useMemo } from "react";

export interface PackageContextProviderProps {
    services?: Record<string, Service<Record<string, unknown>>>;
    properties?: {
        [packageName: string]: Record<string, unknown>;
    };
    children?: ReactNode;
}

/**
 * Injects services and properties into the component tree.
 * React components using pioneer hooks like `useService` and `useProperties`
 * will receive the mocked properties here instead.
 */
export const PackageContextProvider: FC<PackageContextProviderProps> = (props) => {
    const { services: inputServices, properties: inputProperties, children } = props;
    const contextMethods = useMemo((): PackageContextMethods => {
        const services = inputServices ?? {};
        const properties = inputProperties ?? {};
        return {
            // TODO: Support for classifiers and multiple services
            getService(packageName, interfaceName) {
                void packageName; // ignored
                const service = services[interfaceName];
                if (!service) {
                    throw new Error(
                        `Interface name not bound for testing: '${interfaceName}'. Update the configuration of PackageContextProvider.`
                    );
                }
                return service;
            },
            getServices(packageName, interfaceName) {
                return [this.getService(packageName, interfaceName, {})];
            },
            getProperties(packageName) {
                const packageProperties = properties[packageName];
                if (!packageProperties) {
                    throw new Error(
                        `No properties for package '${packageName}' bound for testing. Update the configuration of PackageContextProvider.`
                    );
                }
                return packageProperties;
            }
        };
    }, [inputServices, inputProperties]);

    return (
        <InternalPackageContext.Provider value={contextMethods}>
            {children}
        </InternalPackageContext.Provider>
    );
};
