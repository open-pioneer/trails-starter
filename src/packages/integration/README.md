# @open-pioneer/integration

Provides techniques for the communication between an application (web component) and its embedding site.
This is useful when the application's web component is embedded into another site.

The package exports the `ApiExtension` interface that can be used to provide API functions
that can be called from the outer site to trigger actions in the web component.
The ApiExtension support is implemented in the `@open-pioneer/runtime` package.

Additionally, the package contains the `ExternalEventService`,
which can be used to emit events to the host site from inside the open pioneer application.

## Quick start

### Web component API

To provide API functions a service providing `"integration.ApiExtension"` needs to be implemented.
The service must implement the `ApiExtension` interface with its `getApiMethods()` function.
The functions returned by `getApiMethods()` will be available as methods on the web component's API.

For example:

```js
// build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        ExampleApiExtension: {
            provides: "integration.ApiExtension",
            ...
        },
        ...
    },
    ...
});
```

```ts
// TextApiExtension.ts
import { ServiceOptions } from "@open-pioneer/runtime";
import { ApiExtension } from "@open-pioneer/integration";

// implement ApiExtension interface
export class TextApiExtension implements ApiExtension {
    // returns a set of methods that will be added to the web component's API.
    async getApiMethods() {
        return {
            // exampleMethodName method is available
            exampleMethodName: (sampleParamter: string) => {
                // do something
            }
        };
    }
}
```

To use the API methods in the surrounding site, call the `when()` method on the app.
It resolves to the app's API when the application has started.
Thereupon it is possible to call the provided methods on the returned API instance.
The `when()` method is implemented in the `createCustomElement` function of `CustomElements.ts` in the runtime package.

For Example:

```html
<!DOCTYPE html>
<html lang="en">
    ...
    <body>
        <api-app id="app"></api-app>
        <script type="module" src="example-path/app.ts"></script>
    </body>
    <script>
        customElements.whenDefined("api-app").then(() => {
            const app = document.getElementById("app");
            app.when().then((api) => {
                api.exampleMethodName("Exmaple string");
            });
        });
    </script>
</html>
```

### ExternalEventService

In your UI or one of your services, reference the `"integration.ExternalEventService"` interface to obtain an instance of the `ExternalEventService`.
For example:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        YourService: {
            references: {
                eventService: "integration.ExternalEventService"
            }
        }
    }
});
```

Then, call `emitEvent` on the service to emit an event:

```js
// The second parameter supports arbitrary payloads.
eventService.emitEvent("extent-selected", {
    extent: ...
});

// You can also emit your own event instances (subclasses of the browser's Event class etc.)
eventService.emitEvent(new CustomEvent(...));
```

The events will be emitted on the application's host node.
You can subscribe to them from outside the application via `addEventListener`:

```js
/* If the html looks like this:
    <html>
        <body>
            <my-pioneer-app id="app"></my-pioneer-app>
        </body>
    </html>
*/
const app = document.getElementById("app");
app.addEventListener("extent-selected", (event) => {
    console.log("Selected extent:", event.detail.extent);
});
```
