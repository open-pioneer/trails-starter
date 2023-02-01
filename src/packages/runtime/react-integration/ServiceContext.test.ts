import { ReactIntegration } from "./ReactIntegration";
import { ServiceLayer } from "./../services/ServiceLayer";
/**
 * @vitest-environment jsdom
 */
import { createElement } from "react";
import { expect, it } from "vitest";
import { useServiceInternal } from "./hooks";
import { createCustomElement } from "../CustomElement";
import { Service } from "../Service";
import { TestUtils } from "../test/TestUtils";

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
    customElements.define("test-elem", elem);
    const customElement = await TestUtils.render("test-elem");
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
        serviceLayer
    });
    serviceLayer.start();
    reactIntegration.render(TestComponent, {});
    const error = await errorMessage;
    expect(error.message).toMatchSnapshot();
});
