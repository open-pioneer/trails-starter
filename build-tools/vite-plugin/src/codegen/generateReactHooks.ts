export function generateReactHooks(packageName: string, runtimeModuleId: string) {
    return `
import { useServiceInternal, usePropertiesInternal } from ${JSON.stringify(runtimeModuleId)};

const PACKAGE_NAME = ${JSON.stringify(packageName)};
export const useService = useServiceInternal.bind(undefined, PACKAGE_NAME);
export const useProperties = usePropertiesInternal.bind(undefined, PACKAGE_NAME);
    `.trim();
}
