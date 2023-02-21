import { useContext, useMemo } from "react";
import { Error } from "@open-pioneer/core";
import { InterfaceName, ServiceType } from "../ServiceRegistry";
import { PackageContext as PackageContext, PackageContextMethods } from "./PackageContext";
import { ErrorId } from "../errors";
import { PackageI18n } from "../I18n";

export interface UseServiceOptions {
    /** An additional qualifier to disambiguate service instances that implement the same interface. */
    qualifier?: string;
}

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
    interfaceName: Interface,
    options?: UseServiceOptions
): ServiceType<Interface>;
export function useServiceInternal(
    packageName: string,
    interfaceName: string,
    options?: UseServiceOptions
): unknown;
export function useServiceInternal(
    packageName: string,
    interfaceName: string,
    options?: UseServiceOptions
): unknown {
    const context = useContext(PackageContext);
    const service = useMemo(
        () =>
            checkContext("useService", context).getService(
                packageName,
                interfaceName,
                options ?? {}
            ),
        [context, packageName, interfaceName, options]
    );
    return service;
}

/**
 * Returns all services that implement the given interface.
 * Receives the package name of the importing package as a string.
 *
 * This is an internal hook that is typically called indirectly via the hook
 * provided from `"open-pioneer:react-hooks"`.
 *
 * @private
 */
export function useServicesInternal<Interface extends InterfaceName>(
    packageName: string,
    interfaceName: Interface
): ServiceType<Interface>[];
export function useServicesInternal(packageName: string, interfaceName: string): unknown[];
export function useServicesInternal(packageName: string, interfaceName: string): unknown[] {
    const context = useContext(PackageContext);
    const services = useMemo(
        () => checkContext("useServices", context).getServices(packageName, interfaceName),
        [context, packageName, interfaceName]
    );
    return services;
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

/**
 * Returns the i18n object for the given package.
 *
 * This is an internal hook that is typically called indirectly via the hook
 * provided from `"open-pioneer:react-hooks"`.
 *
 * @private
 */
export function useI18nInternal(packageName: string): PackageI18n {
    const context = useContext(PackageContext);
    return checkContext("useI18n", context).getI18n(packageName);
}

function checkContext(
    hookName: string,
    contextData: PackageContextMethods | null
): PackageContextMethods {
    if (!contextData) {
        throw new Error(
            ErrorId.INTERNAL,
            `"Failed to access package context from '${hookName}': react integration was not set up properly.`
        );
    }
    return contextData;
}
