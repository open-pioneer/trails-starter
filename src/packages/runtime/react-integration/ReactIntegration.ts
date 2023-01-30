import { ComponentType, createElement, StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { ServiceLayer } from "../services/ServiceLayer";
import { ServiceContext, ServiceContextData } from "./ServiceContext";

export interface ReactIntegrationOptions {
    serviceLayer: ServiceLayer;
    rootNode: HTMLDivElement;
}

export class ReactIntegration {
    private serviceLayer: ServiceLayer;
    private root: Root;
    private contextValues: ServiceContextData;

    constructor(options: ReactIntegrationOptions) {
        this.serviceLayer = options.serviceLayer;
        this.root = createRoot(options.rootNode);
        this.contextValues = {
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
            }
        };
    }

    render(component: ComponentType, props: Record<string, unknown>) {
        const element = createElement(component, props);
        const contextWrapper = createElement(
            ServiceContext.Provider,
            { value: this.contextValues },
            element
        );
        this.root.render(createElement(StrictMode, undefined, contextWrapper));
    }

    destroy() {
        this.root.unmount();
    }
}
