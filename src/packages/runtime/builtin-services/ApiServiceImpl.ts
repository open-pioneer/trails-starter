import { ServiceOptions } from "../Service";
import { ApiExtension, ApiMethod, ApiService } from "../api";

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
        for (const p of this.providers) {
            // TODO: Handle collisions, call providers in parallel.
            const methods = await p.getApiMethods();
            Object.assign(api, methods);
        }
        return api;
    }
}
