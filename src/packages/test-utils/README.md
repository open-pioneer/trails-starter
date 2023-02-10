# @open-pioneer/test-utils

This package contains test utilities that make it easier to test parts of a pioneer application.

## Web Component utilities

Provides a few helpers to render web components into the DOM.

The helpers can be used to make testing web components that use a Shadow DOM easier.

Example:

```js
/**
 * @vitest-environment jsdom
 */
import { it, expect } from "vitest";
import { createElement } from "react";
import { createCustomElement } from "@open-pioneer/runtime";
import { renderComponentShadowDOM } from "@open-pioneer/test-utils/web-components";

it("should render a custom component into the dom", async () => {
    // Define a custom element class.
    // The shadow root must be open for testing to work (which is the default during development).
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
```

Take a look at the tests in this package for mor examples.

## React utilities

Provides helpers to make testing of react components easier that use the hooks from the `"open-pioneer:react-hooks"` module (e.g. `useService`).

The developer can provide custom service implementations, properties etc. using a simple parent component.

Example:

```js
import { expect, it } from "vitest";
import { screen, render } from "@testing-library/react";
import { PackageContextProvider } from "@open-pioneer/test-utils/react";
import { useProperties, useService, useServices } from "open-pioneer:react-hooks";

it("should allow injection of service from the test", async () => {
    // A simple component that uses a service.
    function Component() {
        const service = useService("testService");
        return <div>Message: {service.getMessage()}</div>;
    }

    // Setup test services.
    const mocks = {
        services: {
            testService: {
                getMessage() {
                    return "Hello World!";
                }
            }
        }
    };

    // The PackageContextProvider parent ensures that the useService() in our test component works.
    render(
        <PackageContextProvider {...mocks}>
            <Component />
        </PackageContextProvider>
    );

    const div = await screen.findByText(/^Message:/);
    expect(div).toMatchSnapshot();
});
```

Take a look at the tests in this package for mor examples.
