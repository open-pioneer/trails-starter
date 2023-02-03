import { ComponentType, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { ServiceLayer } from "../services/ServiceLayer";
import { PackageContextData } from "./PackageContext";
import { PackageRepr } from "../services/PackageRepr";
import { ReactRootComponent } from "./ReactRootComponent";

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
    private packageContext: PackageContextData;

    constructor(options: ReactIntegrationOptions) {
        this.containerNode = options.container;
        this.packages = options.packages;
        this.serviceLayer = options.serviceLayer;
        this.root = createRoot(options.rootNode);
        this.packageContext = {
            getService: (packageName, interfaceName) => {
                const result = this.serviceLayer.getService(packageName, interfaceName);
                if (result.type === "unimplemented") {
                    throw new Error(
                        ErrorId.INTERFACE_NOT_FOUND,
                        `The UI of package '${packageName}' requested the unimplemented interface '${interfaceName}'.`
                    );
                }
                if (result.type === "undeclared") {
                    throw new Error(
                        ErrorId.UNDECLARED_DEPENDENCY,
                        `Package '${packageName}' did not declare an UI dependency on interface '${interfaceName}'.` +
                            ` Add the dependency to the package configuration or remove the usage.`
                    );
                }
                return result.instance;
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

    render(component: ComponentType, props: Record<string, unknown>) {
        this.root.render(
            createElement(ReactRootComponent, {
                Component: component,
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
