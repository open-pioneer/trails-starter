# Best practices and common issues

## Best practices

### Logging

The framework provides a logger for standardized application wide logging.
The log level is configured globally in the vite.config.js.

To create a logger instance, call the `createLogger` method.
It takes a prefix (string) to prepend to each message.
The prefix should always contain the package name and if applicable additionally the service/class name (separated with ':').

The logger provides log methods for the following log levels with the following order: DEBUG < INFO < WARN < ERROR.

For example:

```ts
import { createLogger, Logger } from "@open-pioneer/core";

export class LoggerTestExample {
    private logger: Logger;
    constructor() {
        this.logger = createLogger("example-package:LoggerTestExample");
    }

    testMethod() {
        this.logger.warn("example message", { testLog: 123, text: "this is a text" });
    }
}
```

Hint: If you're using the logger instead of the browser's builtin console, the original trace will usually be lost lost.
However, in Chrome you can see the trace for error and warning messages by clicking on the message title.
In Firefox this only seems to work for error messages.

### Event handling

We currently do not have a global event bus.
Instead, a developer can use the `EventEmitter` class from `@open-pioneer/core` to implement events that can be subscribed to.
EventEmitter supports both inheritance and direct use.

For example:

```js
import { EventEmitter } from "@open-pioneer/core";
const emitter = new EventEmitter();
const events = [];
const handle = emitter.on("mouseClicked", (event) => observed.push(event));
emitter.emit("mouseClicked", { x: 1, y: 2 });
handle.destroy(); // don't forget to unsubscribe during cleanup
```

## Common issues

### Services are not started

Only referenced services will be constructed.
If you do not provide any interfaces, or if you are never referenced (either by the UI or by another service), your service will not be started.

### Hot reloading with \[jt\]sx-Files and side effects

Vite will automatically hot reload `.jsx` and `.tsx` files when they are being edited.
Most changes to react components can then be applied without reloading the page.

However, during hot reload, the containing module will be executed again.
It should therefore be free of side effects on module level.

This might be a problem if a `.[jt]sx` defines a Web Component (via `customElements.define(...)`) because redefining a Web Component is an error.

There are two recommendations to avoid problems:

1. As a general rule, try to keep your `.jsx` and `.tsx` modules free of side effects.
2. Don't use `app.tsx` or `app.jsx` during development.
   Instead, use a plain `app.ts` or `app.js` and put the React UI in a different file.

### Licensing: ol-mapbox-style

The package `ol-mapbox-style` has been disabled (see `pnpm.overrides` in root `package.json`) because of licensing reasons.
It uses some dependencies from the @mapbox organization with unclear licenses.
If mapbox styles are needed in a project, those dependencies should be vetted (by ensuring their licenses are declared correctly or contacting their authors).
