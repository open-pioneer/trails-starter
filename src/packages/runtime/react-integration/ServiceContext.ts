import { createContext } from "react";
import { Service } from "../Service";

export interface ServiceContextData {
    getService: (packageName: string, interfaceName: string) => Service;
}

export const ServiceContext = createContext<ServiceContextData | null>(null);
