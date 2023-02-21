import { ComponentType, StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { ServiceLayer } from "../service-layer/ServiceLayer";
import { PackageContext, PackageContextMethods } from "./PackageContext";
import { PackageRepr } from "../service-layer/PackageRepr";
import { InterfaceSpec, renderInterfaceSpec } from "../service-layer/InterfaceSpec";
import { renderAmbiguousServiceChoices } from "../service-layer/ServiceLookup";
import { CustomChakraProvider } from "@open-pioneer/chakra-integration";

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
                    return result.value.getInstanceOrThrow();
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
            getServices: (packageName, interfaceName) => {
                const result = this.serviceLayer.getServices(packageName, interfaceName);
                if (result.type === "found") {
                    return result.value.map((serviceRepr) => serviceRepr.getInstanceOrThrow());
                }

                switch (result.type) {
                    case "undeclared":
                        throw new Error(
                            ErrorId.UNDECLARED_DEPENDENCY,
                            `Package '${packageName}' did not declare an UI dependency on all services implementing interface '${interfaceName}'.` +
                                ` Add the dependency ("all": true) to the package configuration or remove the usage.`
                        );
                }
            },
            getProperties: (packageName) => {
                return this.getPackage(packageName).properties;
            },
            getI18n: (packageName) => {
                return this.getPackage(packageName).i18n;
            }
        };
    }

    render(Component: ComponentType, props: Record<string, unknown>) {
        this.root.render(
            <StrictMode>
                <CustomChakraProvider container={this.containerNode} colorMode="light">
                    <PackageContext.Provider value={this.packageContext}>
                        <Component {...props} />
                    </PackageContext.Provider>
                </CustomChakraProvider>
            </StrictMode>
        );
    }

    destroy() {
        this.root.unmount();
    }

    private getPackage(packageName: string): PackageRepr {
        const pkg = this.packages.get(packageName);
        if (!pkg) {
            throw new Error(
                ErrorId.INTERNAL,
                `Package '${packageName}' was not found in application.`
            );
        }
        return pkg;
    }
}
