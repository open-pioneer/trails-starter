import { ComponentType, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { ServiceLayer } from "../services/ServiceLayer";
import { PackageContextMethods } from "./PackageContext";
import { PackageRepr } from "../services/PackageRepr";
import { ReactRootComponent } from "./ReactRootComponent";
import { InterfaceSpec, renderInterfaceSpec } from "../services/InterfaceSpec";
import { renderAmbiguousServiceChoices } from "../services/ServiceRepr";

export interface ReactIntegrationOptions {
    packages: Map<string, PackageRepr>;
    serviceLayer: ServiceLayer;
    rootNode: HTMLDivElement;
    container: Node;
}

export class ReactIntegration {
    private containerNode: Node;
    private packages: Map<string, PackageRepr>;
    private serviceLayer: ServiceLayer;
    private root: Root;
    private packageContext: PackageContextMethods;

    constructor(options: ReactIntegrationOptions) {
        this.containerNode = options.container;
        this.packages = options.packages;
        this.serviceLayer = options.serviceLayer;
        this.root = createRoot(options.rootNode);
        this.packageContext = {
            getService: (packageName, interfaceName, options) => {
                const spec: InterfaceSpec = { interfaceName, ...options };
                const result = this.serviceLayer.getService(packageName, spec);
                if (result.type === "found") {
                    return result.service.getInstanceOrThrow();
                }

                const renderedSpec = renderInterfaceSpec(spec);
                switch (result.type) {
                    case "unimplemented":
                        throw new Error(
                            ErrorId.INTERFACE_NOT_FOUND,
                            `The UI of package '${packageName}' requested the unimplemented interface ${renderedSpec}.`
                        );
                    case "undeclared":
                        throw new Error(
                            ErrorId.UNDECLARED_DEPENDENCY,
                            `Package '${packageName}' did not declare an UI dependency on interface ${renderedSpec}.` +
                                ` Add the dependency to the package configuration or remove the usage.`
                        );
                    case "ambiguous": {
                        const renderedChoices = renderAmbiguousServiceChoices(result.choices);
                        throw new Error(
                            ErrorId.AMBIGUOUS_DEPENDENCY,
                            `The UI of package '${packageName}' requires the ambiguous interface ${renderedSpec}.` +
                                ` Possible choices are: ${renderedChoices}.`
                        );
                    }
                }
            },
            getProperties: (packageName) => {
                const pkg = this.packages.get(packageName);
                if (!pkg) {
                    throw new Error(
                        ErrorId.INTERNAL,
                        `Package '${packageName}' was not found in application.`
                    );
                }
                return pkg.properties;
            }
        };
    }

    render(Component: ComponentType, props: Record<string, unknown>) {
        this.root.render(
            createElement(ReactRootComponent, {
                Component: Component,
                componentProps: props,
                container: this.containerNode,
                packageContext: this.packageContext
            })
        );
    }

    destroy() {
        this.root.unmount();
    }
}
