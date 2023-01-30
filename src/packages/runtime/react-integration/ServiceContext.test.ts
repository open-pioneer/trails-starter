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
