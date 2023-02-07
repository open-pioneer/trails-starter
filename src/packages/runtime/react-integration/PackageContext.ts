import { createContext } from "react";
import { Service } from "../Service";

export interface PackageContextMethods {
    getService: (packageName: string, interfaceName: string) => Service;
    getProperties: (packageName: string) => Readonly<Record<string, unknown>>;
}

export const PackageContext = createContext<PackageContextMethods | null>(null);
