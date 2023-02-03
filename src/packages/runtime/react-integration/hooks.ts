import { useContext, useMemo } from "react";
import { Error } from "@open-pioneer/core";
import { InterfaceName, ServiceType } from "../ServiceRegistry";
import { PackageContext as PackageContext, PackageContextData } from "./PackageContext";
import { ErrorId } from "../errors";

/**
 * Returns a service that implements the given interface.
 * Receives the package name of the importing package as a string.
 *
 * This is an internal hook that is typically called indirectly via the hook
 * provided from `"open-pioneer:react-hooks"`.
 *
 * @private
 */
export function useServiceInternal<Interface extends InterfaceName>(
    packageName: string,
    interfaceName: Interface
): ServiceType<Interface>;
export function useServiceInternal(packageName: string, interfaceName: string): unknown;
export function useServiceInternal(packageName: string, interfaceName: string) {
    const context = useContext(PackageContext);
    const service = useMemo(
        () => checkContext("useService", context).getService(packageName, interfaceName),
        [context, packageName, interfaceName]
    );
    return service;
}

/**
 * Returns the properties for the given package.
 *
 * This is an internal hook that is typically called indirectly via the hook
 * provided from `"open-pioneer:react-hooks"`.
 *
 * @private
 */
export function usePropertiesInternal(packageName: string): Readonly<Record<string, unknown>> {
    const context = useContext(PackageContext);
    return checkContext("useProperties", context).getProperties(packageName);
}

function checkContext(
    hookName: string,
    contextData: PackageContextData | null
): PackageContextData {
    if (!contextData) {
        throw new Error(
            ErrorId.INTERNAL,
            `"Failed to access package context from '${hookName}': react integration was not set up properly.`
        );
    }
    return contextData;
}
