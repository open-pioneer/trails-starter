import { Component, createElement } from "react";
import { beforeAll, expect, it, describe } from "vitest";
import { createCustomElement } from "./CustomElement";
import { usePropertiesInternal } from "./react-integration";
import { TestUtils } from "./test/TestUtils";

class TestComponent extends Component<Record<string, string>> {
    render() {
        return createElement("span", this.props, `Hello ${this.props.name}`);
    }
}

describe("simple rendering", function () {
    let elem: CustomElementConstructor;
    const TAG = "sample-element";
    const STYLE = ".test { color: red }";

    beforeAll(() => {
        elem = createCustomElement({
            component: () => createElement("div", { className: "test" }, "hello world"),
            styles: STYLE,
            openShadowRoot: true
        });
        customElements.define(TAG, elem);
    });

    it("should return html element", () => {
        expect(new elem()).toBeInstanceOf(HTMLElement);
    });

    it("should render html", async () => {
        const node = await TestUtils.render(TAG);
        const div = await TestUtils.waitForSelector(".test", node.shadowRoot!);
        expect(div.innerHTML).toBe("hello world");
    });

    it("should render use styles", async () => {
        const node = await TestUtils.render(TAG);
        const style = await TestUtils.waitForSelector("style", node.shadowRoot!);
        expect(style.innerHTML).toBe(STYLE);
    });

    it("should clean up its content when removed from the dom", async () => {
        const node = await TestUtils.render(TAG);
        await TestUtils.waitForSelector(".test", node.shadowRoot!);

        // Unlinks from document
        node.remove();

        // Wait until divs are gone
        await TestUtils.waitForRemoval("div");
        expect(node.shadowRoot?.innerHTML).toBe("");
    });
});

it("should render test component with attribute 'name'", async () => {
    const attributeValue = "test";
    const elem = createCustomElement({
        component: (props) =>
            createElement("div", { id: "wrapper" }, createElement(TestComponent, props)),
        attributes: ["name"],
        openShadowRoot: true
    });
    customElements.define("test-elem", elem);
    const customElement = await TestUtils.render("test-elem");
    customElement.setAttribute("name", attributeValue);
    const selectedElem = await TestUtils.waitForSelector("#wrapper", customElement.shadowRoot!);
    expect(selectedElem.querySelector("span")!.innerHTML).toBe(`Hello ${attributeValue}`);
});

it("should allow customization of package properties", async () => {
    const elem = createCustomElement({
        component: function TestComponent() {
            const properties = usePropertiesInternal("test");
            return createElement("span", undefined, properties.greeting as string);
        },
        openShadowRoot: true,
        packages: {
            test: {
                name: "test",
                properties: {
                    greeting: {
                        value: "Hello World"
                    }
                }
            }
        },
        properties: {
            test: {
                greeting: "Hello User"
            }
        }
    });
    customElements.define("test-elem-2", elem);
    const customElement = await TestUtils.render("test-elem-2");
    const selectedElem = await TestUtils.waitForSelector("span", customElement.shadowRoot!);
    expect(selectedElem!.innerHTML).toBe(`Hello User`);
});

it("should allow customization of package properties through a callback", async () => {
    const elem = createCustomElement({
        component: function TestComponent() {
            const properties = usePropertiesInternal("test");
            return createElement("span", undefined, properties.greeting as string);
        },
        openShadowRoot: true,
        packages: {
            test: {
                name: "test",
                properties: {
                    greeting: {
                        value: "Hello World"
                    }
                }
            }
        },
        properties: {
            test: {
                greeting: "Hello User"
            }
        },
        // properties from this callback take precedence
        async resolveProperties() {
            return {
                test: {
                    greeting: "Bye User"
                }
            };
        }
    });
    customElements.define("test-elem-3", elem);
    const customElement = await TestUtils.render("test-elem-3");
    const selectedElem = await TestUtils.waitForSelector("span", customElement.shadowRoot!);
    expect(selectedElem!.innerHTML).toBe("Bye User");
});
