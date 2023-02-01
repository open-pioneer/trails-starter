import { useContext, useMemo } from "react";
import { InterfaceName, ServiceType } from "../ServiceRegistry";
import { ServiceContext } from "./ServiceContext";

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
    const context = useContext(ServiceContext);
    const service = useMemo(
        () => context?.getService(packageName, interfaceName),
        [context, packageName, interfaceName]
    );
    return service;
}
