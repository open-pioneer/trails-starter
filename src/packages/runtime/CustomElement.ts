import { ReactNode } from "react";
import { createRoot as createReactRoot, Root as ReactRoot } from "react-dom/client";

export interface CustomElementOptions {
    component: ReactNode;
    styles: string;

    /**
     * Whether the shadow root element is accessible from the outside.
     * @default false
     */
    openShadowRoot?: boolean;
}

export function createCustomElement(options: CustomElementOptions): CustomElementConstructor {
    const Clazz = class PioneerApplication extends globalThis.HTMLElement {
        #shadowRoot: ShadowRoot;
        #rootNode: HTMLDivElement | undefined;
        #reactRoot: ReactRoot | undefined;

        constructor() {
            super();
            this.#shadowRoot = this.attachShadow({
                mode: options.openShadowRoot ? "open" : "closed"
            });
        }

        connectedCallback() {
            const node = (this.#rootNode = globalThis.document.createElement("div"));
            this.#shadowRoot.replaceChildren(node);

            const reactRoot = (this.#reactRoot = createReactRoot(node));
            reactRoot.render(options.component);
            console.log("CONNECTED");
        }

        disconnectedCallback() {
            this.#shadowRoot.replaceChildren();
            this.#reactRoot?.unmount();
            this.#reactRoot = undefined;
            this.#rootNode = undefined;
            console.log("DISCONNECTED");
        }
    };
    return Clazz;
}
