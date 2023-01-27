import { ComponentType, createElement, StrictMode } from "react";
import { createRoot as createReactRoot, Root as ReactRoot } from "react-dom/client";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "./errors";
import { PackageMetadata } from "./metadata";
import { PackageRepr, parsePackages } from "./services/PackageRepr";
import { ServiceLayer } from "./services/ServiceLayer";
import { getErrorChain } from "@open-pioneer/core";
import { ComponentContext, ServiceContext } from "./ComponentContext";

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
        #reactRoot: ReactRoot | undefined;
        #props: Record<string, string> = {};
        #contextValues: ComponentContext | undefined = undefined;

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
                this.#contextValues = {
                    getService: (serviceName: string) => {
                        const service = this.#serviceLayer?.serviceIndex.get(serviceName)?.instance;
                        if (!service) {
                            throw new Error(
                                ErrorId.INTERNAL,
                                `service with name '${serviceName}' not defined for component`
                            );
                        }
                        return service;
                    }
                };

                const style = document.createElement("style");
                style.appendChild(document.createTextNode(options.styles ?? ""));
                this.#shadowRoot.replaceChildren(node, style);

                this.#reactRoot = createReactRoot(node);
                this.render();
            } catch (e) {
                logError(e);
            }
        }

        private render() {
            if (this.#reactRoot && this.#contextValues) {
                const component = createElement(options.component, this.#props);
                const contextWrapper = createElement(
                    ServiceContext.Provider,
                    { value: this.#contextValues },
                    component
                );
                this.#reactRoot.render(createElement(StrictMode, undefined, contextWrapper));
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

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            if (newValue) {
                this.#props[name] = newValue ?? undefined;
            }
            this.render();
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
