import { createContext } from "react";
import { PackageI18n } from "../I18n";
import { Service } from "../Service";
import { UseServiceOptions } from "./hooks";

export interface PackageContextMethods {
    getService: (packageName: string, interfaceName: string, options: UseServiceOptions) => Service;
    getServices: (packageName: string, interfaceName: string) => Service[];
    getProperties: (packageName: string) => Readonly<Record<string, unknown>>;
    getI18n(packageName: string): PackageI18n;
}

export const PackageContext = createContext<PackageContextMethods | null>(null);
