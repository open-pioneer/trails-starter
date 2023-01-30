export function generateReactHooks(packageName: string, runtimeModuleId: string) {
    return `
import { useServiceInternal } from ${JSON.stringify(runtimeModuleId)};

export const useService = useServiceInternal.bind(undefined, ${JSON.stringify(packageName)});    
    `.trim();
}
