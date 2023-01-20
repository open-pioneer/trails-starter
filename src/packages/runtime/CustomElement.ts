import { createElement, ReactNode, StrictMode } from "react";
import { createRoot as createReactRoot, Root as ReactRoot } from "react-dom/client";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "./errors";
import { BundleMetadata } from "./Metadata";
import { BundleRepr, parseBundles } from "./services/BundleRepr";
import { ServiceLayer } from "./services/ServiceLayer";
import { getErrorChain } from "@open-pioneer/core";

/**
 * Options for the {@link createCustomElement} function.
 */
export interface CustomElementOptions {
    /**
     * Rendered UI component.
     */
    component: ReactNode;

    /**
     * Bundle metadata.
     * Metadata structures contain information about services
     * that are needed during runtime.
     *
     * Services provided by bundles in this attribute will be started
     * as necessary and can be referenced during runtime.
     */
    bundles?: Record<string, BundleMetadata>;

    /**
     * Styles for UI component.
     */
    styles?: string;

    /**
     * Whether the shadow root element is accessible from the outside.
     * @default false
     */
    openShadowRoot?: boolean;
}

/**
 * Creates a new custom element class (web component) that can be registered within a DOM.
 *
 * @example
 * ```ts
 * const CustomElementClazz = createCustomElement({
 *   component: <div>Hello World!</div>,
 *   styles: "div {background-color: red;}",
 * });
 * customElements.define("sample-element", CustomElementClazz);
 * ```
 */
export function createCustomElement(options: CustomElementOptions): CustomElementConstructor {
    let bundles: BundleRepr[];
    try {
        bundles = parseBundles(options.bundles ?? {});
    } catch (e) {
        throw new Error(ErrorId.INVALID_METADATA, "Failed to parse bundle metadata.");
    }

    class PioneerApplication extends HTMLElement {
        #shadowRoot: ShadowRoot;
        #rootNode: HTMLDivElement | undefined;
        #serviceLayer: ServiceLayer | undefined;
        #reactRoot: ReactRoot | undefined;

        constructor() {
            super();
            this.#shadowRoot = this.attachShadow({
                mode: options.openShadowRoot ? "open" : "closed"
            });
        }

        connectedCallback() {
            const node = (this.#rootNode = document.createElement("div"));

            try {
                const serviceLayer = (this.#serviceLayer = new ServiceLayer(bundles));
                serviceLayer.start();

                const style = document.createElement("style");
                style.appendChild(document.createTextNode(options.styles ?? ""));
                this.#shadowRoot.replaceChildren(node, style);

                const reactRoot = (this.#reactRoot = createReactRoot(node));
                reactRoot.render(createElement(StrictMode, undefined, options.component));
            } catch (e) {
                logError(e);
            }
        }

        disconnectedCallback() {
            this.#reactRoot?.unmount();
            this.#reactRoot = undefined;
            this.#shadowRoot.replaceChildren();
            this.#rootNode = undefined;
            this.#serviceLayer?.destroy();
            this.#serviceLayer = undefined;
        }
    }
    return PioneerApplication;
}

function logError(e: unknown) {
    if (e instanceof Error) {
        const chain = getErrorChain(e).reverse();
        if (chain.length === 1) {
            console.error(e);
            return;
        }

        let n = 1;
        for (const error of chain) {
            console.error(`#${n}`, error);
            ++n;
        }
    } else {
        console.error("Unexpected error", e);
    }
}
