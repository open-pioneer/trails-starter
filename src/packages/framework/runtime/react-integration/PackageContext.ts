// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { createContext } from "react";
import { PackageIntl } from "../i18n";
import { Service } from "../Service";
import { UseServiceOptions } from "./hooks";

export interface PackageContextMethods {
    getService: (packageName: string, interfaceName: string, options: UseServiceOptions) => Service;
    getServices: (packageName: string, interfaceName: string) => Service[];
    getProperties: (packageName: string) => Readonly<Record<string, unknown>>;
    getIntl(packageName: string): PackageIntl;
}

export const PackageContext = createContext<PackageContextMethods | null>(null);
