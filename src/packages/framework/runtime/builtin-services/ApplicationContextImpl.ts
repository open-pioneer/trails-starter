// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { ApplicationContext } from "../api";
import { ServiceOptions } from "../Service";

export interface ApplicationContextProperties {
    host: HTMLElement;
    shadowRoot: ShadowRoot;
    container: HTMLElement;
    locale: string;
    supportedLocales: string[];
}

export class ApplicationContextImpl implements ApplicationContext {
    #host: HTMLElement;
    #shadowRoot: ShadowRoot;
    #container: HTMLElement;
    #locale: string;
    #supportedLocales: readonly string[];

    constructor(options: ServiceOptions, properties: ApplicationContextProperties) {
        this.#host = properties.host;
        this.#shadowRoot = properties.shadowRoot;
        this.#container = properties.container;
        this.#locale = properties.locale;
        this.#supportedLocales = Object.freeze(Array.from(properties.supportedLocales));
    }

    getHostElement(): HTMLElement {
        return this.#host;
    }

    getShadowRoot(): ShadowRoot {
        return this.#shadowRoot;
    }

    getApplicationContainer(): HTMLElement {
        return this.#container;
    }

    getLocale(): string {
        return this.#locale;
    }

    getSupportedLocales(): readonly string[] {
        return this.#supportedLocales;
    }
}
