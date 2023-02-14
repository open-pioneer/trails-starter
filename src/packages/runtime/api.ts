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

/**
 * A service provided by the system.
 * Used by the runtime to assemble the public facing API.
 */
export interface ApiService {
    /**
     * Called by the runtime to gather methods that should be available from the web component's API.
     */
    getApi(): Promise<ApiMethods>;
}

/**
 * A service provided by the system, useful for accessing values that are global to the application.
 */
export interface ApplicationContext {
    /**
     * The web component's host element.
     * This dom node can be accessed by the host site.
     */
    getHostElement(): HTMLElement;

    /**
     * The current web component's shadow root.
     */
    getShadowRoot(): ShadowRoot;

    /**
     * The node containing the rest of the application _inside_ the current web component's shadow dom.
     */
    getApplicationContainer(): HTMLElement;
}

declare module "./ServiceRegistry" {
    interface ServiceRegistry {
        "runtime.ApiExtension": ApiExtension;
        "runtime.ApiService": ApiService;
    }
}
