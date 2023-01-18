import { beforeAll, expect, it } from "vitest";

import { createCustomElement } from "./CustomElement";

let elem: CustomElementConstructor;
const tag = "sample-element";
const style = ".test { color: red }";

beforeAll(() => {
    elem = createCustomElement({ 
        component: <div className="test">hello world</div>, 
        styles: style, 
        openShadowRoot: true 
    });
    customElements.define(tag, elem);
});

it("should return html element", () => {
    expect(new elem).toBeInstanceOf(HTMLElement);
});

it("should render html", async () => {
    const node  = await TestUtils.render(tag);
    const div = await TestUtils.waitForSelector(".test", node.shadowRoot!);
    expect(div.innerHTML).toBe("hello world");
});

it("should render use styles", async () => {
    const node  = await TestUtils.render(tag);
    expect(node.shadowRoot!.querySelector("style")!.innerHTML).toBe(style);
});

class TestUtils {
    static render(tag: string) {
        TestUtils._renderToDocument(tag);
        return TestUtils.waitForSelector(tag);
    }

    static _renderToDocument(tag: string) {
        document.body.innerHTML = `<${tag}></${tag}>`;
    }

    static async waitForSelector(tag: string, parent: ParentNode = document) {
        return new Promise<Element>(resolve => {
            function requestComponent() {
                const element = parent.querySelector(tag);
                if (element) {
                    resolve(element);
                } else {
                    window.requestAnimationFrame(requestComponent);
                }
            }
            requestComponent();
        });
    }
}