# React Integration

This framework currently requires all UI components to be written using [React](https://reactjs.org/).

## Application UI

The application provides a react component to the `createCustomElement` function.
The react component will be rendered in the web component produced by that function:

```jsx
// apps/test-app/app.ts
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { TestComponent } from "./TestComponent";

const Element = createCustomElement({
    component: TestComponent, // React component
    appMetadata
});

customElements.define("test-app", Element);
```

## Accessing Packages and Services

UI Components written in React must be able to interact with the package system and the service layer.
This means that services, package properties and package i18n must be accessible.

In a react component, the developer can write:

```jsx
//  apps/test-app/TestComponent.jsx
import { useService, useIntl, useProperties } from "open-pioneer:react-hooks";

function TestComponent() {
    const service = useService("foo.bar");
    const intl = useIntl(); // i18n data for `test-app`
    const properties = useProperties(); // properties for `test-app`
    // ...
}
```

`useIntl` and `useProperties` must return the appropriate value for `test-app`.
`useService` returns the requested service (if it can be found) and is also supposed to
check that `test-app` actually declares a reference to `foo.bar` (for dependency hygiene).

### Using the package context

React supports two ways to provide values to a component: [Props](https://reactjs.org/docs/components-and-props.html) and the [Context API](https://reactjs.org/docs/context.html).
Props are used for "direct" arguments from parent component to child, whereas context values are provided into the entire react component tree rooted in a `Provider`.

Since (potentially) all react component require access to the service layer, we have chosen to transport references via the context API instead of props: using props would put a lot of manual work on the developer (forwarding values all the time) and would also pollute component interfaces with mostly internal stuff like i18n and service references.

When the UI is rendered (`Component` in the example), it is always surrounded by a `PackageContext.Provider`:

```ts
// @open-pioneer/runtime/react-integration/ReactIntegration.tsx
// ...
function render(Component: ComponentType, props: Record<string, unknown>) {
    this.root.render(
        <StrictMode>
            <CustomChakraProvider container={this.containerNode}>
                <PackageContext.Provider value={this.packageContext}>
                    <Component {...props} />
                </PackageContext.Provider>
            </CustomChakraProvider>
        </StrictMode>
    );
}
// ...
```

The `packageContext` contains references to all packages (and their services) in the application.
It is an internal data structure that can only be used indirectly through the provided hooks (e.g. `useService`),
but in theory it is accessible to the entire react part of the application.
There is only one `packageContext` per application, shared between all packages.

Obtaining a reference to the `packageContext` looks like this:

```ts
// @open-pioneer/runtime/react-integration/hooks.ts
export function useIntlInternal(packageName: string): PackageIntl {
    // returns the `value` from the code snippet above
    const context = useContext(PackageContext);
    // plain method call to look for intl of the given package
    return checkContext("useIntl", context).getIntl(packageName);
}
```

`useIntlInternal` is the implementation of the `useIntl` hook.
It retrieves the packageContext using react's Context API and then attempts to find a package with the given name
in the shared lookup structure, finally returning its `intl` value.

`useIntlInternal` is not supposed to be called directly because the `packageName` can easily be mistyped or set to the name of a different package (violating encapsulation).
Instead, developers invoke the `useIntl` hook exported from the module `"open-pioneer:react-hooks"`.
The module is implemented in the vite plugin: it automatically detects the containing package, looks for the `package.json` and reads the package `name` from that file, saving the developer from maintaining the package name manually.

The following example shows the content of `"open-pioneer:react-hooks"` when imported from an application package called `"properties-app"`:

```js
import {
    useServiceInternal,
    useServicesInternal,
    usePropertiesInternal,
    useIntlInternal
} from "/packages/framework/runtime/react-integration/index.ts";

const PACKAGE_NAME = "properties-app";
export const useService = /*@__PURE__*/ useServiceInternal.bind(undefined, PACKAGE_NAME);
export const useServices = /*@__PURE__*/ useServicesInternal.bind(undefined, PACKAGE_NAME);
export const useProperties = /*@__PURE__*/ usePropertiesInternal.bind(undefined, PACKAGE_NAME);
export const useIntl = /*@__PURE__*/ useIntlInternal.bind(undefined, PACKAGE_NAME);
```

### Getting services from the service layer

The `useService` and `useServices` hooks are implemented very similar to the `useIntlInternal` hook above.
They use a shared reference to the [`ServiceLayer`](./ServiceLayer.md) (which has been started before the UI is being rendered) to find services in the application (methods `getService` / `getServices`).
