# How to provide an API

An app is a package that provides a web component. The web component is usually embedded into a host site.
In some use cases it can be beneficial to implement communication between the app and the surrounding site.

When implementing such a communication, two communication directions should be taken into account:
communication from the host side to the web component and the other way around.

The framework provides techniques for both directions.
The outer site can call API methods implemented in the app to trigger actions in the web component
and on the other hand the web component can emit events to be received by the outer site.
In the following tutorial we will see how to use both techniques.

## Web component API

To allow the outer side to trigger actions in the web component, we can provide API functions in the app.
These functions can then be called from the surrounding site to control the app.

Following, we will extend the empty app (at `src/apps/empty`) so that it provides an API method which
simply logs a message into the browsers console.

### Create an API Extension that provides an API method

First, we need to implement a service that will provide the API methods.
For simplicity, we will create the extension service directly in the app package.

Add a new file `LogApiExtension.ts` in the empty app directory (`src/apps/empty`).
In the file create a new class (e.g. `LogApiExtension`) that implements the `ApiExtension` interface from `"@open-pioneer/integration"`.

Your class should look like this:

```ts
// src/apps/empty/LogApiExtension.ts
import { ApiExtension } from "@open-pioneer/integration";

// implement ApiExtension interface
export class LogApiExtension implements ApiExtension {}
```

Make sure to additionally add the `"@open-pioneer/integration": "workspace:^"` dependency in the package.json, then run `pnpm install`.

Now you should see an error similar to "Property 'getApiMethods' is missing" on the class.
This is because the interface requires that a function `getApiMethods` must exist.
This function should return a set of methods - wrapped in a `Promise` - which will become available as methods in the app's API.

Thus, add the implementation for this async function in your class. It should return an object with a single method called `logText` which simple logs the string that it is called with to the console.

```ts
// src/apps/empty/LogApiExtension.ts
import { ApiExtension } from "@open-pioneer/integration";

export class LogApiExtension implements ApiExtension {
    // returns a set of methods that will be added to the web component's API.
    async getApiMethods() {
        return {
            // logText method can be called from the host site
            logText: (text: string) => {
                console.log(text);
            }
        };
    }
}
```

We must export it from the `services.ts` (or `.js`) module so it can be found by the framework later:

```ts
// src/apps/empty/services.ts
export { LogApiExtension } from "./LogApiExtension";
```

Additionally, we need to declare the service in the `build.config.mjs`.
It is important that it provides the interface `"integration.ApiExtension"`: the framework will collect all the services providing this interface to generate the API.

```js
// src/apps/empty/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        LogApiExtension: {
            provides: "integration.ApiExtension"
        }
    }
});
```

Now, the API should provide the `logText` method.

### Using the API method in the surrounding site

To use the provided `logText` method we will call it from the surrounding site.
The "empty" app is by default embedded in the `index.html` at `sites/empty`.

Open the `index.html`, add an id to the empty-app element and add a script tag.
Using JavaScript we need to call the `when()` method on the app.
It resolves to the app's API when the application has started.

```html
<!-- src/sites/empty/index.html -->
<!DOCTYPE html>
<html lang="en">
    ...
    <body>
        <empty-app id="app"></empty-app>
        <!-- set id -->
        <script type="module" src="/apps/empty/app.ts"></script>
        <script>
            customElements.whenDefined("empty-app").then(() => {
                const app = document.getElementById("app");
                // call when() method on the app to wait for the app to be started
                app.when().then((api) => {});
            });
        </script>
    </body>
</html>
```

Now it is possible to call the provided methods on the returned API instance.
To do this, simply call the method on the returned API:

```html
<!-- src/sites/empty/index.html -->
<!DOCTYPE html>
<html lang="en">
    ...
    <body>
        <empty-app id="app"></empty-app>
        <script type="module" src="/apps/empty/app.ts"></script>
        <script>
            customElements.whenDefined("empty-app").then(() => {
                const app = document.getElementById("app");
                app.when().then((api) => {
                    // call the provided method
                    api.logText("Test text");
                });
            });
        </script>
    </body>
</html>
```

If you run the dev mode and load the empty app in your browser,
you should see a log message with the text "Test text" in the browser's console.

TODO:

## Web component events

It is also possible to emit browser events from inside the web component.
These events will be dispatched from the application's host element.

You can reference the interface `"integration.ExternalEventService"` (implemented by package `@open-pioneer/integration
`) to obtain the event service:

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

```js
// In your service / UI
eventService.emitEvent("my-custom-event", {
    // ... data
});
```

```js
// In the host site
const app = document.getElementById("app");
app.addEventListener("my-custom-event", (event) => {
    console.log(event);
});
```

See the package documentation of `@open-pioneer/integration` for more details.
