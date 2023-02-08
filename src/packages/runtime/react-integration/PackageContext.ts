import { createContext } from "react";
import { Service } from "../Service";
import { UseServiceOptions } from "./hooks";

export interface PackageContextMethods {
    getService: (packageName: string, interfaceName: string, options: UseServiceOptions) => Service;
    getProperties: (packageName: string) => Readonly<Record<string, unknown>>;
}

export const PackageContext = createContext<PackageContextMethods | null>(null);
