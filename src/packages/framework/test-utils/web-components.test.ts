// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * @vitest-environment jsdom
 */
import { createCustomElement } from "@open-pioneer/runtime";
import { findByTestId } from "@testing-library/dom";
import { createElement } from "react";
import { afterEach, expect, it } from "vitest";
import { defineComponent, renderComponent, renderComponentShadowDOM } from "./web-components";

afterEach(() => {
    document.body.innerHTML = "";
});

it("should render a web component into the dom", async function () {
    class CustomComponent extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = `<span data-testid="foo" class="hello">Hello World</span>`;
        }
    }

    const { node } = await renderComponent(CustomComponent);
    const span = await findByTestId(node, "foo");
    expect(span.className).toEqual("hello");
    expect(span.textContent).toEqual("Hello World");
});

it("should render the same component multiple times (needs shared tag name)", async function () {
    // A web component class cannot be registered multiple times.
    class CustomComponent extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            const greeting = this.getAttribute("greeting") ?? "";
            this.innerHTML = `<span class="hello">${greeting}</span>`;
        }
    }

    const tag = defineComponent(CustomComponent);
    const container1 = document.createElement("div");
    const container2 = document.createElement("div");
    document.body.append(container1, container2);

    const { node: node1 } = await renderComponent(tag, {
        attributes: {
            greeting: "Hello"
        },
        container: container1
    });

    const { node: node2 } = await renderComponent(tag, {
        attributes: {
            greeting: "Bye"
        },
        container: container2
    });

    expect([node1.innerHTML, node2.innerHTML]).toMatchSnapshot();
});

it("should render a web component with a shadow dom", async function () {
    class CustomComponent extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: "open" }); // Must be open in tests for queries to work
        }

        connectedCallback() {
            this.shadowRoot!.innerHTML = `
                <div class="container">
                    <span class="hello">Hello World</span>
                </div>
            `;
        }
    }

    // Waits for the shadow dom to render and returns the inner container (and queries that search within in).
    const { node, innerContainer, queries } = await renderComponentShadowDOM(CustomComponent, {
        innerContainerSelector: ".container"
    });
    expect(node.shadowRoot).toBeDefined();
    expect(innerContainer.tagName).toEqual("DIV");
    expect(innerContainer.className).toEqual("container");

    // Searches in `.container`
    const span = await queries.findByText(/Hello/);
    expect(span).toMatchSnapshot();
});

it("should render a custom component into the dom", async () => {
    const elem = createCustomElement({
        component: () => createElement("div", { className: "test" }, "hello world")
    });

    // Waits until the component is rendered.
    // Returns an inner container from the shadow dom (`.pioneer-root` by default).
    // The queries object searches in that inner container.
    const { queries } = await renderComponentShadowDOM(elem);
    const div = await queries.findByText("hello world");
    expect(div.className).toBe("test");
});
