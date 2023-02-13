// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiMethod = (...args: any[]) => any;

export interface ApiExtension {
    getApiMethods(): Promise<Record<string, ApiMethod>>;
}

export interface ApiService {
    getApi(): Promise<Record<string, ApiMethod>>;
}

declare module "./ServiceRegistry" {
    interface ServiceRegistry {
        "runtime.ApiExtension": ApiExtension;
        "runtime.ApiService": ApiService;
    }
}
