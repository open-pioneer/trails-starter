import { ServiceOptions } from "../Service";
import { ApiExtension, ApiMethod, ApiService } from "../api";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";

interface References {
    providers: ApiExtension[];
}

export class ApiServiceImpl implements ApiService {
    private readonly providers: ApiExtension[];

    constructor(options: ServiceOptions<References>) {
        this.providers = options.references.providers;
    }

    async getApi() {
        const api: Record<string, ApiMethod> = {};
        const promises = [];
        for (const p of this.providers) {
            promises.push(p.getApiMethods());
        }

        Promise.all(promises).then((providerMethods) => {
            // TODO: provide better error message (in which providers have the duplicate methods be defined?)
            providerMethods.forEach((methods) => {
                for (const methodName in methods) {
                    if (api[methodName]) {
                        throw new Error(
                            ErrorId.DUPLICATE_API_METHODS,
                            `Api method with name '${methodName}' was defined multiple times.`
                        );
                    }
                }
                Object.assign(api, methods);
            });
        });

        return api;
    }
}
