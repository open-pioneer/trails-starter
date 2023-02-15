# @open-pioneer/application-events

Provides the `EventService`, which can be used to emit events to the host site from inside the open pioneer application.

This is useful when the application's web component is embedded into another site.

## Quick start

In your UI or one of your services, reference the `"application-events.EventService"` interface to obtain an instance of the `EventService`.
For example:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        YourService: {
            references: {
                eventService: "application-events.EventService"
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
