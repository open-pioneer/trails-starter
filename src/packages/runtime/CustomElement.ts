import { createElement, ReactNode, StrictMode } from "react";
import { createRoot as createReactRoot, Root as ReactRoot } from "react-dom/client";
import { BundleMetadata } from "./Metadata";

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
    const Clazz = class PioneerApplication extends HTMLElement {
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
            const node = (this.#rootNode = document.createElement("div"));
            
            const style = document.createElement("style");
            style.appendChild(document.createTextNode(options.styles ?? ""));
            
            this.#shadowRoot.replaceChildren(node, style);
           
            const reactRoot = (this.#reactRoot = createReactRoot(node));
            reactRoot.render(
                createElement(StrictMode, undefined, options.component)
            );
        }

        disconnectedCallback() {
            this.#shadowRoot.replaceChildren();
            this.#reactRoot?.unmount();
            this.#reactRoot = undefined;
            this.#rootNode = undefined;
        }
    };
    return Clazz;
}
