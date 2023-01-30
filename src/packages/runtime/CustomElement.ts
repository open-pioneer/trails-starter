import { ComponentType } from "react";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "./errors";
import { PackageMetadata } from "./metadata";
import { PackageRepr, parsePackages } from "./services/PackageRepr";
import { ServiceLayer } from "./services/ServiceLayer";
import { getErrorChain } from "@open-pioneer/core";
import { ReactIntegration } from "./react-integration/ReactIntegration";

/**
 * Options for the {@link createCustomElement} function.
 */
export interface CustomElementOptions {
    /**
     * Rendered UI component.
     */
    component: ComponentType<Record<string, string>>;

    /**
     * Package metadata.
     * Metadata structures contain information about services
     * that are needed during runtime.
     *
     * Services provided by packages in this attribute will be started
     * as necessary and can be referenced during runtime.
     */
    packages?: Record<string, PackageMetadata>;

    /**
     * Attribute names for component inputs. Changes on this attributes
     * triggers the component rendering.
     */
    attributes?: string[];

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
    class PioneerApplication extends HTMLElement {
        #shadowRoot: ShadowRoot;
        #rootNode: HTMLDivElement | undefined;
        #serviceLayer: ServiceLayer | undefined;
        #reactIntegration: ReactIntegration | undefined;
        #props: Record<string, string> = {};

        static get observedAttributes() {
            return options.attributes ?? [];
        }

        constructor() {
            super();
            this.#shadowRoot = this.attachShadow({
                mode: options.openShadowRoot ? "open" : "closed"
            });
        }

        connectedCallback() {
            const node = (this.#rootNode = document.createElement("div"));
            node.style.height = "100%";
            node.style.width = "100%";
            try {
                const serviceLayer = (this.#serviceLayer = createServiceLayer(options?.packages));
                serviceLayer.start();

                const style = document.createElement("style");
                style.appendChild(document.createTextNode(options.styles ?? ""));
                this.#shadowRoot.replaceChildren(node, style);

                this.#reactIntegration = new ReactIntegration({
                    rootNode: node,
                    serviceLayer
                });
                this.#render();
            } catch (e) {
                logError(e);
            }
        }

        #render() {
            this.#reactIntegration?.render(options.component, this.#props);
        }

        disconnectedCallback() {
            this.#reactIntegration?.destroy();
            this.#reactIntegration = undefined;
            this.#shadowRoot.replaceChildren();
            this.#rootNode = undefined;
            this.#serviceLayer?.destroy();
            this.#serviceLayer = undefined;
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            this.#props[name] = newValue ?? "";
            this.#render();
        }
    }
    return PioneerApplication;
}

function createServiceLayer(packageMetadata: Record<string, PackageMetadata> | undefined) {
    let packages: PackageRepr[];
    try {
        packages = parsePackages(packageMetadata ?? {});
    } catch (e) {
        throw new Error(ErrorId.INVALID_METADATA, "Failed to parse package metadata.", {
            cause: e
        });
    }
    return new ServiceLayer(packages);
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
