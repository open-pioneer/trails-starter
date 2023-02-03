import { ReactIntegration } from "./ReactIntegration";
import { ServiceLayer } from "../services/ServiceLayer";
/**
 * @vitest-environment jsdom
 */
import { createElement } from "react";
import { expect, it } from "vitest";
import { usePropertiesInternal, useServiceInternal } from "./hooks";
import { createCustomElement } from "../CustomElement";
import { Service } from "../Service";
import { TestUtils } from "../test/TestUtils";
// eslint-disable-next-line import/no-relative-packages
import { UI as TestUI } from "./test-data/test-package/UI";

export interface TestProvider {
    value: string;
}

it("should render component and using service which manipulates dom", async () => {
    function TestComponent() {
        const service = useServiceInternal("test", "test.Provider") as TestProvider;
        return createElement("span", undefined, `Hello ${service.value}`);
    }
    const elem = createCustomElement({
        component: (props) =>
            createElement("div", { id: "wrapper" }, createElement(TestComponent, props)),
        openShadowRoot: true,
        packages: {
            test: {
                name: "test",
                services: {
                    Provider: {
                        name: "Provider",
                        clazz: class Provider implements Service<TestProvider> {
                            value = "TEST";
                        },
                        provides: [
                            {
                                name: "test.Provider"
                            }
                        ]
                    }
                },
                ui: {
                    references: ["test.Provider"]
                }
            }
        }
    });
    customElements.define("test-elem-1", elem);
    const customElement = await TestUtils.render("test-elem-1");
    const selectedElem = await TestUtils.waitForSelector("#wrapper", customElement.shadowRoot!);
    expect(selectedElem.querySelector("span")!.innerHTML).toBe("Hello TEST");
});

it("should get error while use undefined service", async () => {
    // TODO: better test for React UI integration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveCallback: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMessage = new Promise<any>((resolve) => {
        resolveCallback = resolve;
    });

    function TestComponent() {
        try {
            const service = useServiceInternal("test", "test.Provider") as TestProvider;
            return createElement("span", undefined, `Hello ${service.value}`);
        } catch (error) {
            resolveCallback(error);
        }
        return null;
    }
    const wrapper = document.createElement("div");
    const serviceLayer = new ServiceLayer([]);
    const reactIntegration = new ReactIntegration({
        rootNode: wrapper,
        container: wrapper,
        serviceLayer,
        packages: new Map()
    });
    serviceLayer.start();
    reactIntegration.render(TestComponent, {});
    const error = await errorMessage;
    expect(error.message).toMatchSnapshot();
});

it("should be able to read properties from react component", async function () {
    function TestComponent() {
        const properties = usePropertiesInternal("test");
        return createElement("span", undefined, `Hello ${properties.name}`);
    }

    const elem = createCustomElement({
        component: (props) =>
            createElement("div", { id: "wrapper" }, createElement(TestComponent, props)),
        openShadowRoot: true,
        packages: {
            test: {
                name: "test",
                properties: {
                    name: {
                        value: "USER"
                    }
                }
            }
        }
    });
    customElements.define("test-elem-2", elem);
    const customElement = await TestUtils.render("test-elem-2");
    const selectedElem = await TestUtils.waitForSelector("#wrapper", customElement.shadowRoot!);
    expect(selectedElem.querySelector("span")!.innerHTML).toBe("Hello USER");
});

it("should get error when requesting properties from an unknown package", async () => {
    // TODO: better test for React UI integration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveCallback: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorMessage = new Promise<any>((resolve) => {
        resolveCallback = resolve;
    });

    function TestComponent() {
        try {
            const properties = usePropertiesInternal("test");
            return createElement("span", undefined, `Hello ${properties.name}`);
        } catch (error) {
            resolveCallback(error);
        }
        return null;
    }
    const wrapper = document.createElement("div");
    const serviceLayer = new ServiceLayer([]);
    const reactIntegration = new ReactIntegration({
        rootNode: wrapper,
        container: wrapper,
        serviceLayer,
        packages: new Map()
    });
    serviceLayer.start();
    reactIntegration.render(TestComponent, {});
    const error = await errorMessage;
    expect(error.message).toMatchSnapshot();
});

it("should provide the autogenerated useProperties hook", async () => {
    const testPackageName = "@open-pioneer/runtime__react_test_package";
    const elem = createCustomElement({
        component: TestUI,
        openShadowRoot: true,
        packages: {
            [testPackageName]: {
                name: testPackageName,
                properties: {
                    greeting: {
                        value: "Hello World!"
                    }
                }
            }
        }
    });
    customElements.define("test-elem-3", elem);
    const customElement = await TestUtils.render("test-elem-3");
    const selectedElem = await TestUtils.waitForSelector(".ui", customElement.shadowRoot!);
    expect(selectedElem!.innerHTML).toBe("Hello World!");
});
