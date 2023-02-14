// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiMethod = (...args: any[]) => any;

export type ApiMethods = Record<string, ApiMethod>;

/**
 * Provides a set of methods to the application's web component API.
 */
export interface ApiExtension {
    /**
     * Returns a set of methods that will be added to the web component's API.
     */
    getApiMethods(): Promise<ApiMethods>;
}

export interface ApiService {
    /**
     * Called by the runtime to gather methods that should be available from the web component's API.
     */
    getApi(): Promise<ApiMethods>;
}

declare module "./ServiceRegistry" {
    interface ServiceRegistry {
        "runtime.ApiExtension": ApiExtension;
        "runtime.ApiService": ApiService;
    }
}
