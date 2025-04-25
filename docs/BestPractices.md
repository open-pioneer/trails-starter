# Best practices and common issues

## Best practices

### Logging

The framework provides a logger for standardized application wide logging.
The log level is configured globally in the vite.config.js.

We recommend to use this logger for all log messages to achieve a uniform logging.
This is especially helpful if the loglevel should be change or the logger should be
replaced with a new implementation later on.

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

Hint: If you're using the logger instead of the browser's builtin console, the original trace is usually lost.
However, in Chrome you can see the trace for error and warning messages by clicking on the message title.
In Firefox this only seems to work for error messages.

### HTTP requests

Use the central `http.HttpService` (see [@open-pioneer/http](https://www.npmjs.com/package/@open-pioneer/http)) to perform HTTP requests.
The service exposes the method `fetch()` which is compatible to (and implemented in terms of) the Browser's modern [`fetch()` function](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

Using a central method is important for future proofing our development.
We might add new features such as automatic authentication (e.g. tokens) or automatic proxy support which users of the `HttpService`
can then automatically take advantage of.

### Dependency management

(p-)npm packages support multiple different kinds of dependencies in their `package.json`: `dependencies`, `peerDependencies`, `devDependencies` and `optionalDependencies` (although we will skip the latter one as it is only rarely used).

When developing locally in the context of an app and "local" packages, you can often get away with being imprecise about your package's dependencies - things will often "just work".
In this case, it is "just" a good practice to be precise in your dependency management.
When you're developing shared packages (e.g. published on npmjs.com), good dependency management becomes critical, or you code will not work when used by other developers.

When thinking about dependencies, follow these general guidelines:

- When referencing a tool used all over your repository (such as `prettier` or `@open-pioneer/vite-plugin-pioneer`),
  declare it as a `devDependency` in your project's root `package.json`.
  This way you don't have to duplicate the dependency in every package of your workspace.

- When requiring functionality at runtime (e.g. `import ...`) from a source file in an app or package,
  add the other package in your own `package.json` as either `dependency` or `peerDependency`.
  The `build-pioneer-package` tool enforces this rule.

    Example:

    ```jsonc
    {
        "name": "my-package",
        "dependencies": {
            "other-package": "^1.2.3"
        }
    }
    ```

- Use "open" specifiers for dependencies like `^`.
  Not depending on a fixed version avoid conflicts if multiple packages prefer slightly different versions.

#### dependencies vs peerDependencies

[This post](https://indepth.dev/posts/1187/npm-peer-dependencies) is a great explainer for the differences between `dependencies` and `peerDependencies`.
See also npm's [reference documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#peerdependencies).

Both `dependencies` and `peerDependencies` refer to packages required at runtime, but `dependencies` will be duplicated when incompatible versions are required, whereas `peerDependencies` will report an error should that be the case.
Although `peerDependencies` look like the correct solution on paper, they have some annoying limitations in current versions of pnpm.
For example, transitive dependencies (peer dependencies of peer dependencies) are sometimes not updated correctly, even though all users of those packages request newer versions.
**For this reason, we currently prefer to use `dependencies`.**

To enforce that only a single version of a package is present (a builtin feature of peer dependencies), we use a custom CLI tool instead (see [`pnpm check-duplicates`](./RepositoryGuide.md#pnpm-check-duplicates)).

#### Useful helpers

- `pnpm why DEP` from an app's or package's directory can show why a certain version of a package is present in your dependency tree.

    For example:

    ```bash
    # Show why ol@^9 is present in the dependency tree (-r inspects all packages in the workspace)
    $ pnpm why -r ol@^9
    ```

- `pnpm ls` can show the dependency tree of a package or app (see also the `--depth` option).
- `pnpm dedupe` works hard to de-duplicate packages wherever possible.
- `pnpm update`, e.g. with the `-r` flag, is useful to update dependencies.

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

## Development Setup

### Debugging Vitest

#### Intellij IDEA

In Intellij IDEA the debugging of Vitest tests in monorepos may lead to problems.
However, it is possible to define a custom run configuration to enable debugging:

- In Intellij open the "Run/Debug Configurations" dialog ("Run" --> "Edit Configurations").
- Create a new configuration by clicking the "+" icon in the upper left.
- Select "Node.js" from the new configuration list.
- Choose a name (e.g. "Vitest") and ensure that the node interpreter (node.exe) and working directory
  (trails project root path) are selected reasonable.
- In the field "JavaScript file" add the path to vitest.mjs (e.g. `./node_modules/vitest/vitest.mjs`)
- In the field "Application parameters" add the following: `run --threads false --testTimeOut 30000 <Relative path to your test file>`. The `testTimeOut`is optional, however useful for long-running tests. Example: `run --threads false --testTimeout 30000 src/packages/legend/Legend.test.tsx`
- Click "save". Run the new configuration in debug mode zu start debugging.

Official information for debugging Vitest in Intellij IDEA can be found in the Vitest documentation:
https://vitest.dev/guide/debugging#intellij-idea  
Note: the link references the newest version of vitest

## Common issues

### Services are not started

Only referenced services will be constructed.
If a service does not provide any interfaces, or if the service is never referenced (either by the UI or by another service), the service will not be started.

If absolutely necessary, you can force a service to start even if it's not referenced by anyone by providing the `runtime.AutoStart` interface, see [how to create a service](./tutorials/HowToCreateAService.md#service-autostart).

### Hot reloading with \[jt\]sx-Files and side effects

Vite will automatically hot reload `.jsx` and `.tsx` files when they are being edited.
Most changes to react components can then be applied without reloading the page.

However, during hot reload, the containing module will be executed again.
It should therefore be free of side effects at the module level.

This might be a problem if a `.[jt]sx` defines a Web Component (via `customElements.define(...)`) because redefining a Web Component is an error.

There are two recommendations to avoid problems:

1. As a general rule, try to keep your `.jsx` and `.tsx` modules free of side effects.
2. Don't use `app.tsx` or `app.jsx` during development.
   Instead, use a plain `app.ts` or `app.js` and put the React UI in a different file.
