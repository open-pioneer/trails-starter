import { ComponentType } from "react";
import {
    createAbortError,
    destroyResource,
    Error,
    isAbortError,
    Resource,
    throwAbortError
} from "@open-pioneer/core";
import { ErrorId } from "./errors";
import { ApplicationMetadata, ObservableBox, PackageMetadata } from "./metadata";
import { PackageRepr, createPackages } from "./service-layer/PackageRepr";
import { ServiceLayer } from "./service-layer/ServiceLayer";
import { getErrorChain } from "@open-pioneer/core";
import { ReactIntegration } from "./react-integration/ReactIntegration";
import { ApiMethods, ApiService } from "./api";
import { createManualPromise, ManualPromise } from "./utils";
import { createBuiltinPackage } from "./builtin-services";

/**
 * Options for the {@link createCustomElement} function.
 */
export interface CustomElementOptions {
    /**
     * Rendered UI component.
     */
    component?: ComponentType<Record<string, string>>;

    /** Generated application metadata. */
    appMetadata?: ApplicationMetadata;

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
    resolveProperties?(ctx: PropertyContext): Promise<ApplicationProperties | undefined>;

    /**
     * Attribute names for component inputs. Changes on this attributes
     * triggers the component rendering.
     */
    attributes?: string[];

    /**
     * Whether the shadow root element is accessible from the outside.
     * Defaults to `false` in production mode and `true` during development to make testing easier.
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
 * The interface implemented by web components produced via {@link createCustomElement}.
 */
export interface ApplicationElement extends HTMLElement {
    /** Resolves to the element's API when the application has started. */
    when(): Promise<ApiMethods>;
}

export interface ApplicationElementConstructor {
    new (): ApplicationElement;
}

/**
 * Creates a new custom element class (web component) that can be registered within a DOM.
 *
 * @example
 * ```ts
 * import * as appMetadata from "open-pioneer:app";
 *
 * const CustomElementClazz = createCustomElement({
 *   component: <div>Hello World!</div>,
 *   appMetadata
 * });
 * customElements.define("sample-element", CustomElementClazz);
 * ```
 */
export function createCustomElement(options: CustomElementOptions): ApplicationElementConstructor {
    class PioneerApplication extends HTMLElement implements ApplicationElement {
        #shadowRoot: ShadowRoot;
        #state: ElementState | undefined;

        static get observedAttributes() {
            return options.attributes ?? [];
        }

        constructor() {
            super();

            const mode = options.openShadowRoot ?? import.meta.env.DEV ? "open" : "closed";
            this.#shadowRoot = this.attachShadow({
                mode: mode
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

        when() {
            if (!this.#state) {
                return Promise.reject(
                    new Error(
                        ErrorId.NOT_MOUNTED,
                        "Cannot use the application's API because the HTML element has not yet been mounted into the DOM."
                    )
                );
            }

            return this.#state.whenAPI();
        }
    }
    return PioneerApplication;
}

class ElementState {
    private hostElement: HTMLElement;
    private shadowRoot: ShadowRoot;
    private options: CustomElementOptions;
    private props: Record<string, string> = {};
    private apiPromise: ManualPromise<ApiMethods> | undefined; // Present when callers are waiting for the API
    private api: ApiMethods | undefined; // Present once started

    private state = "not-started" as "not-started" | "starting" | "started" | "destroyed";
    private container: HTMLDivElement | undefined;
    private serviceLayer: ServiceLayer | undefined;
    private reactIntegration: ReactIntegration | undefined;
    private stylesWatch: Resource | undefined;

    constructor(hostElement: HTMLElement, shadowRoot: ShadowRoot, options: CustomElementOptions) {
        this.hostElement = hostElement;
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
        this.apiPromise?.reject(createAbortError());
        this.reactIntegration = destroyResource(this.reactIntegration);
        this.shadowRoot.replaceChildren();
        this.container = undefined;
        this.serviceLayer = destroyResource(this.serviceLayer);
        this.stylesWatch = destroyResource(this.stylesWatch);
    }

    whenAPI(): Promise<ApiMethods> {
        if (this.api) {
            return Promise.resolve(this.api);
        }

        const apiPromise = (this.apiPromise ??= createManualPromise());
        return apiPromise.promise;
    }

    onAttributeChanged(name: string, value: string | undefined) {
        this.props[name] = value ?? "";
        this.render();
    }

    private async startImpl() {
        const { options, shadowRoot, hostElement: outerHtmlElement } = this;

        // Resolve custom application properties
        const properties = await gatherProperties(outerHtmlElement, options);
        if (this.state === "destroyed") {
            throwAbortError();
        }

        // Setup application root node in the shadow dom
        const container = (this.container = document.createElement("div"));
        container.classList.add("pioneer-root");
        container.style.minHeight = "100%";
        container.style.height = "100%";

        // Launch the service layer
        const rawPackages = options?.appMetadata?.packages ?? {};
        const { serviceLayer, packages } = createServiceLayer(
            rawPackages,
            properties,
            createBuiltinPackage({
                host: this.hostElement,
                shadowRoot: this.shadowRoot,
                container: container
            })
        );
        this.serviceLayer = serviceLayer;
        serviceLayer.start();
        await this.initAPI(serviceLayer);

        const styles = options?.appMetadata?.styles;
        const styleNode = document.createElement("style");
        applyStyles(styleNode, styles);
        if (import.meta.hot) {
            this.stylesWatch = styles?.on?.("changed", () => applyStyles(styleNode, styles));
        }

        shadowRoot.replaceChildren(container, styleNode);

        // Launch react
        this.reactIntegration = new ReactIntegration({
            rootNode: container,
            container: shadowRoot,
            serviceLayer,
            packages
        });
        this.render();
        this.state = "started";
    }

    private render() {
        this.reactIntegration?.render(this.options.component ?? emptyComponent, this.props);
    }

    private async initAPI(serviceLayer: ServiceLayer) {
        const result = serviceLayer.getService(
            "@open-pioneer/runtime",
            {
                interfaceName: "runtime.ApiService"
            },
            { ignoreDeclarationCheck: true }
        );
        if (result.type !== "found") {
            throw new Error(
                ErrorId.INTERNAL,
                `Failed to find instance of 'runtime.ApiService' (result type '${result.type}').` +
                    ` This is a builtin service that must be present exactly once.`
            );
        }

        const apiService = result.value.getInstanceOrThrow() as ApiService;
        try {
            const api = (this.api = await apiService.getApi());
            this.apiPromise?.resolve(api);
        } catch (e) {
            throw new Error(ErrorId.INTERNAL, "Failed to gather the application's API methods.", {
                cause: e
            });
        }
    }
}

function createServiceLayer(
    packageMetadata: Record<string, PackageMetadata> | undefined,
    properties: ApplicationProperties,
    builtinPackage: PackageRepr
) {
    let packages: PackageRepr[];
    try {
        packages = createPackages(packageMetadata ?? {}, properties);
    } catch (e) {
        throw new Error(ErrorId.INVALID_METADATA, "Failed to parse package metadata.", {
            cause: e
        });
    }

    // Add builtin services defined within this package.
    if (packages.find((pkg) => pkg.name === builtinPackage.name)) {
        throw new Error(
            ErrorId.INVALID_METADATA,
            "User defined packages must not contain metadata for the runtime package."
        );
    }
    packages.push(builtinPackage);

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

const DISABLE_INHERIT = ":host { all: initial }";

// Applies application styles to the given style node.
// Can be called multiple times in development mode to implement hot reloading.
function applyStyles(styleNode: HTMLStyleElement, styles: ObservableBox<string> | undefined) {
    const cssValue = styles?.value ?? "";
    const cssNode = document.createTextNode([DISABLE_INHERIT, cssValue].join("\n"));
    styleNode.replaceChildren(cssNode);
}

function emptyComponent() {
    return null;
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
