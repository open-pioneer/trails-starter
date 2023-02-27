// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiMethod = (...args: any[]) => any;

/**
 * A record of exposed functions.
 */
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

    /**
     * Returns the current locale of the application.
     *
     * E.g. "de-DE"
     */
    getLocale(): string;

    /**
     * Returns the locales supported by the application.
     *
     * E.g. ["de", "en"]
     */
    getSupportedLocales(): readonly string[];
}

declare module "./ServiceRegistry" {
    interface ServiceRegistry {
        "runtime.ApiService": ApiService;
        "runtime.ApplicationContext": ApplicationContext;
    }
}
