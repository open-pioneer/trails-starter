import { ServiceOptions } from "../Service";
import { ApiExtension, ApiMethod, ApiMethods, ApiService } from "../api";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";

interface References {
    providers: ApiExtension[];
}

export class ApiServiceImpl implements ApiService {
    private readonly providers: [serviceId: string, provider: ApiExtension][];

    constructor(options: ServiceOptions<References>) {
        const providers = options.references.providers;
        const meta = options.referencesMeta.providers;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.providers = providers.map((provider, index) => [meta[index]!.serviceId, provider]);
    }

    async getApi() {
        interface ProviderResult {
            serviceId: string;
            methods: ApiMethods;
        }

        const promises = this.providers.map(async ([serviceId, provider]) => {
            const methods = await provider.getApiMethods();
            const result: ProviderResult = {
                serviceId,
                methods
            };
            return result;
        });
        const providerMethods = await Promise.all(promises);

        interface MethodEntry {
            method: ApiMethod;
            serviceId: string;
        }

        const methodEntries = new Map<string, MethodEntry>();
        for (const { serviceId, methods } of providerMethods) {
            for (const [methodName, method] of Object.entries(methods)) {
                const existingEntry = methodEntries.get(methodName);
                if (existingEntry) {
                    throw new Error(
                        ErrorId.DUPLICATE_API_METHODS,
                        `Cannot define API method '${methodName}' from '${serviceId}' (method is also defined by '${existingEntry.serviceId}').`
                    );
                }

                methodEntries.set(methodName, {
                    serviceId,
                    method
                });
            }
        }

        const api: Record<string, ApiMethod> = {};
        for (const [methodName, entry] of methodEntries.entries()) {
            api[methodName] = entry.method;
        }
        return api;
    }
}
