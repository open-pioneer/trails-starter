import { ApplicationContext } from "../api";
import { ServiceOptions } from "../Service";

export interface ApplicationContextProperties {
    host: HTMLElement;
    shadowRoot: ShadowRoot;
    container: HTMLElement;
}

export class ApplicationContextImpl implements ApplicationContext {
    #host: HTMLElement;
    #shadowRoot: ShadowRoot;
    #container: HTMLElement;

    constructor(options: ServiceOptions, properties: ApplicationContextProperties) {
        this.#host = properties.host;
        this.#shadowRoot = properties.shadowRoot;
        this.#container = properties.container;
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
}
