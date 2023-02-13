import { ServiceOptions } from "./Service";
import { ApiExtension, ApiMethod } from "./api";

interface References {
    providers: ApiExtension[];
}

export class ApiServiceImpl {
    private readonly providers: ApiExtension[];

    constructor(options: ServiceOptions<References>) {
        this.providers = options.references.providers;
    }

    async getApi() {
        const api: Record<string, ApiMethod> = {};
        for (const p of this.providers) {
            const methods = await p.getApiMethods();
            Object.assign(api, methods);
        }
        return api;
    }
}
