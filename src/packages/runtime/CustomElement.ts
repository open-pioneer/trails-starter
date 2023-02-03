import { ComponentType } from "react";
import { Error, isAbortError, throwAbortError } from "@open-pioneer/core";
import { ErrorId } from "./errors";
import { PackageMetadata } from "./metadata";
import { PackageRepr, createPackages } from "./services/PackageRepr";
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
     * Styles for UI component.
     */
    styles?: string;

    /**
     * Application defined properties.
     * These will override default properties of the application's packages.
     */
    properties?: ApplicationProperties;

    /**
     * Function to provide additional application defined properties.
     * Properties returned by this function will override default properties of the application's packages.
     *
     * Compared to {@link properties}, this function receives a context object
     * that allows the developer to provide dynamic properties on a per-application basis.
     *
     * Properties returned by this function take precedence over the ones defined by {@link properties}.
     */
    resolveProperties?(ctx: PropertyContext): Promise<ApplicationProperties>;

    /**
     * Attribute names for component inputs. Changes on this attributes
     * triggers the component rendering.
     */
    attributes?: string[];

    /**
     * Whether the shadow root element is accessible from the outside.
     * @default false
     */
    openShadowRoot?: boolean;
}

/**
 * A context object that is passed to the `resolveProperties` function.
 */
export interface PropertyContext {
    /**
     * Returns an attribute from the application's root node.
     */
    getAttribute(name: string): string | undefined;
}

/**
 * Allows the application to override default properties in all packages.
 */
export interface ApplicationProperties {
    /**
     * Key: the name of the package.
     * Value: A record of configuration properties (key/value pairs).
     *
     * Properties will override default property values in the package.
     */
    [packageName: string]: Record<string, unknown>;
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
        #state: ElementState | undefined;

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
            if (this.#state) {
                this.#state.destroy();
            }

            this.#state = new ElementState(this, this.#shadowRoot, options);
            this.#state.start();
        }

        disconnectedCallback() {
            this.#state?.destroy();
            this.#state = undefined;
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            this.#state?.onAttributeChanged(name, newValue ?? undefined);
        }
    }
    return PioneerApplication;
}

class ElementState {
    private outerHtmlElement: HTMLElement;
    private shadowRoot: ShadowRoot;
    private options: CustomElementOptions;
    private props: Record<string, string> = {};

    private state = "not-started" as "not-started" | "starting" | "started" | "destroyed";
    private rootNode: HTMLDivElement | undefined;
    private serviceLayer: ServiceLayer | undefined;
    private reactIntegration: ReactIntegration | undefined;

    constructor(
        outerHtmlElement: HTMLElement,
        shadowRoot: ShadowRoot,
        options: CustomElementOptions
    ) {
        this.outerHtmlElement = outerHtmlElement;
        this.shadowRoot = shadowRoot;
        this.options = options;
    }

    start() {
        if (this.state !== "not-started") {
            throw new Error(ErrorId.INTERNAL, `Cannot start element in state '${this.state}'`);
        }

        this.state = "starting";
        this.startImpl().catch((e) => {
            // TODO: Error splash?
            this.destroy();
            if (!isAbortError(e)) {
                logError(e);
            }
        });
    }

    destroy() {
        this.state = "destroyed";
        this.reactIntegration?.destroy();
        this.reactIntegration = undefined;
        this.shadowRoot.replaceChildren();
        this.rootNode = undefined;
        this.serviceLayer?.destroy();
        this.serviceLayer = undefined;
    }

    onAttributeChanged(name: string, value: string | undefined) {
        this.props[name] = value ?? "";
        this.render();
    }

    private async startImpl() {
        const { options, shadowRoot, outerHtmlElement } = this;

        // Resolve custom application properties
        const properties = await gatherProperties(outerHtmlElement, options);
        if (this.state === "destroyed") {
            throwAbortError();
        }

        // Launch the service layer
        const { serviceLayer, packages } = createServiceLayer(options.packages, properties);
        this.serviceLayer = serviceLayer;
        serviceLayer.start();

        // Setup application root node in the shadow dom
        const rootNode = (this.rootNode = document.createElement("div"));
        rootNode.style.height = "100%";
        rootNode.style.width = "100%";
        const style = document.createElement("style");
        style.appendChild(document.createTextNode(options.styles ?? ""));
        shadowRoot.replaceChildren(rootNode, style);

        // Launch react
        this.reactIntegration = new ReactIntegration({
            rootNode: rootNode,
            serviceLayer,
            packages
        });
        this.render();
        this.state = "started";
    }

    private render() {
        this.reactIntegration?.render(this.options.component, this.props);
    }
}

function createServiceLayer(
    packageMetadata: Record<string, PackageMetadata> | undefined,
    properties: ApplicationProperties
) {
    let packages: PackageRepr[];
    try {
        packages = createPackages(packageMetadata ?? {}, properties);
    } catch (e) {
        throw new Error(ErrorId.INVALID_METADATA, "Failed to parse package metadata.", {
            cause: e
        });
    }
    return {
        packages: new Map(packages.map((pkg) => [pkg.name, pkg])),
        serviceLayer: new ServiceLayer(packages)
    };
}

async function gatherProperties(rootNode: HTMLElement, options: CustomElementOptions) {
    let properties: ApplicationProperties[];
    try {
        properties = [
            options.properties ?? {},
            (await options.resolveProperties?.({
                getAttribute(name) {
                    return rootNode.getAttribute(name) ?? undefined;
                }
            })) ?? {}
        ];
    } catch (e) {
        throw new Error(
            ErrorId.PROPERTY_RESOLUTION_FAILED,
            "Failed to resolve application properties.",
            {
                cause: e
            }
        );
    }

    return mergeProperties(properties);
}

function mergeProperties(properties: ApplicationProperties[]): ApplicationProperties {
    const merged: ApplicationProperties = {};
    for (const props of properties) {
        for (const [packageName, packageProperties] of Object.entries(props)) {
            const mergedPackageProps = (merged[packageName] ??= {});
            Object.assign(mergedPackageProps, packageProperties);
        }
    }
    return merged;
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
