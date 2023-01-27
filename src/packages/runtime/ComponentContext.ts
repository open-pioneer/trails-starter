import { createContext, useContext } from "react";
import { ServiceLifecycleHooks } from "./Service";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceRegistry {}

export interface ComponentContext {
    getService: (serviceName: string) => ServiceLifecycleHooks;
}

export const ServiceContext = createContext<ComponentContext | null>(null);

export function useService<ServiceName extends keyof ServiceRegistry>(
    serviceName: ServiceName
): ServiceRegistry[ServiceName];
export function useService(serviceName: string): unknown;
export function useService(serviceName: string) {
    const context = useContext(ServiceContext);
    const service = context?.getService(serviceName);
    return service;
}
