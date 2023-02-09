export function generateReactHooks(packageName: string, runtimeModuleId: string) {
    return `
import { useServiceInternal, useServicesInternal, usePropertiesInternal } from ${JSON.stringify(
        runtimeModuleId
    )};

const PACKAGE_NAME = ${JSON.stringify(packageName)};
export const useService = /*@__PURE__*/ useServiceInternal.bind(undefined, PACKAGE_NAME);
export const useServices = /*@__PURE__*/ useServicesInternal.bind(undefined, PACKAGE_NAME);
export const useProperties = /*@__PURE__*/ usePropertiesInternal.bind(undefined, PACKAGE_NAME);
    `.trim();
}
