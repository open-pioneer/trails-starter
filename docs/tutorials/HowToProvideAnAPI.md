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

Make sure to additionally add the `"@open-pioneer/integration": "^1.0.0"` dependency in the package.json, then run `pnpm install`.

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

## Web component events

In the following, we will extend the app to additionally emit events to be received by the outer site.
As an example, we will extend the AppUI to send an event if a button is pressed.

### Emit an event

To emit an event we first need to reference the `"integration.ExternalEventService"` from the UI to obtain the event service.
Therefore, edit the `build.config.mjs`:

```jsonc
// src/apps/empty/build.config.mjs
export default defineBuildConfig({
    ...
    ui: {
        references: ["integration.ExternalEventService"]
    }
});
```

Now we can use the event service in the UI and call its `emitEvent`method when a button is pressed:

```tsx
// src/apps/empty/AppUI.tsx
import { Button, Container, Heading, Text } from "@open-pioneer/chakra-integration";
import { useIntl, useService } from "open-pioneer:react-hooks";

export function AppUI() {
    // ...
    const eventService = useService("integration.ExternalEventService");
    const emitEventOnClick = () => {
        eventService.emitEvent("my-custom-event", {
            data: "my-event-data"
        });
    };

    return (
        <Container>
            {/*...*/}
            <Button onClick={emitEventOnClick}>Emit Event</Button>
        </Container>
    );
}
```

The method takes an event name as a first argument and details in an object as a second parameter.

### Receive event in the host site

To receive the event in the host site, we will edit the `index.html` at `sites/empty` which embeds the empty-app by default.
We add an event listener on the app that simply logs the event in the console if the `my-custom-event` is called:

```html
<!-- src/sites/empty/index.html -->
<!-- ... -->
<body>
    <empty-app id="app"></empty-app>
    <script type="module" src="/apps/empty/app.ts"></script>
    <script>
        customElements.whenDefined("empty-app").then(() => {
            const app = document.getElementById("app");

            // add event listener on the "my-custom-event" event
            app.addEventListener("my-custom-event", (event) => {
                console.log(event);
            });
        });
    </script>
</body>
<!-- ... -->
```

If you run the dev mode and load the empty app in your browser, you should see a button "Emit Event".
If you click this button, the event should be logged into the console.

## Further reading

For more details see the package documentation of `@open-pioneer/integration`.

An additional example is shown in the `api-sample` at `scr/samples`.
