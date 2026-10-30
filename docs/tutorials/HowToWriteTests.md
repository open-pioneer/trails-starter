# How to write tests

This document explains how to write a few different kinds of tests.

## Vitest

We use [`Vitest`](https://vitest.dev/) to run our automated tests.
This section only explain a few basics to get you started, please refer to the [official guide](https://vitest.dev/guide/) for more information.

To run the entire test suite, simply execute the `test` script from the project root:

```bash
$ pnpm test
# ...
# Test Files  14 passed (14)
#      Tests  91 passed (91)
#   Start at  09:41:22
#   Duration  7.11s (transform 4.49s, setup 2ms, collect 22.69s, tests 2.26s)
```

Vitest will, by default, discover all test files in the entire repository and run them all.
We use `<NAME>.test.<EXT>` (with `<EXT>` usually being one of `.js`, `.ts`, `.jsx` or `.tsx`) as the file name pattern, which will be automatically picked up by Vitest.

You can use Vitest's [support for filters](https://vitest.dev/guide/cli.html#command-line-interface) to run only a few tests.
For example, to only run the tests in the `core` package, execute:

```bash
$ pnpm test src/packages/framework/core/
# ✓ packages/framework/core/events.test.ts (6)
# ✓ packages/framework/core/error.test.ts (3)
# ✓ packages/framework/core/Logger.test.ts (7)
#
# Test Files  3 passed (3)
#      Tests  16 passed (16)
#   Start at  09:46:47
#   Duration  1.96s (transform 2.60s, setup 1ms, collect 3.62s, tests 90ms)
```

> **Note**  
> You can also force the execution of a single test (or group of tests) from source code by adding a `.only` in the test registration (`it` or `describe`).
> `.only` should never be committed into source control since it effectively hides all other tests from the system.
> See also Vitest's `--allowOnly` option.

### Watch mode

Vitest will remain running after executing the test suite when executed locally.
It will watch for file changes (similar to Vite's hot reloading) and re-execute tests that are impacted by these changes ([Documentation](https://vitest.dev/guide/features.html#watch-mode)).

### Running Vitest manually

Vitest can be started manually using the following command:

```bash
$ pnpm exec vitest --help
```

## Creating tests

First, we need some functionality to test.
We'll use the empty app (in `src/apps/empty`) as a starting point.

Create a new source file:

```ts
// src/apps/empty/math.ts
export function multiply(a: number, b: number): number {
    return a * b;
}
```

To create tests, simply create a new `*.test.ts` (or `.js` etc.) file.
In this case, we'll reuse the `multiply` file name:

```ts
// src/apps/empty/math.test.ts
import { assert, it } from "vitest"; // (1)
import { multiply } from "./math";

it("multiplies two numbers", () => {
    const result = multiply(7, 6);
    assert.strictEqual(result, 42); // (2)
});
```

- **(1)**  
  Imports test helpers from `vitest`.
  `it` (or `test`) define a new test.
  `describe` can be used to group tests together, to share common setup code for example.

- **(2)**
  `assert` is used to check the result of the multiplication.
  `assert` and `expect` are available from `vitest` to write assertions.

For more details, visit [Vitest's API reference](https://vitest.dev/api/).

Running our new test is as simple as executing the following command:

```bash
$ pnpm test src/apps/empty/
# ✓ apps/empty/math.test.ts (1)
#
#  Test Files  1 passed (1)
#       Tests  1 passed (1)
#    Start at  10:10:42
#    Duration  1.76s (transform 1.16s, setup 0ms, collect 1.14s, tests 3ms)
#
#
#  PASS  Waiting for file changes...
#        press h to show help, press q to quit
```

Leave Vitest running and experiment a bit with both the implementation and your test code (for example, try making it fail).
Vitest will automatically re-run your test when it detects a change.

To conclude this section, we'll add another test:

```ts
// src/apps/empty/math.test.ts
// ...
it("throws when the result is not a number", () => {
    assert.throws(() => multiply(Number.NaN, 5), /Not a number/);
});
```

The test invokes `multiply` and expects an error to be thrown when the multiplication would result in a `NaN` value.
`multiply` does not behave in that way, so this test will currently fail:

```text
 FAIL  apps/empty/math.test.ts > throws when the result is not a number
AssertionError: expected [Function] to throw an error
 ❯ apps/empty/math.test.ts:12:12
     10|
     11| it("throws when the result is not a number", () => {
     12|     assert.throws(() => multiply(Number.NaN, 5), /Not a number/);
       |            ^
     13| });
     14|

  - Expected   "null"
  + Received   "undefined"

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)
   Start at  10:14:43
   Duration  72ms
```

To make the test succeed, update the implementation:

```ts
// src/apps/empty/math.ts
export function multiply(a: number, b: number): number {
    const result = a * b;
    if (Number.isNaN(result)) {
        throw new Error("Not a number");
    }
    return result;
}
```

Vitest will now report success:

```text
 RERUN  apps/empty/math.ts x10

 ✓ apps/empty/math.test.ts (2)

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  10:17:46
   Duration  33ms


 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

## UI Tests (browser mode)

Vitest can be used to write simple UI tests.
We recommend using the [Vitest browser mode](https://vitest.dev/guide/browser/#browser-mode) which is part of the Vitest API and allows you to run tests natively in the browser.

The repository is already prepared for using Vitest browser mode. It is configured to use playwright as a provider.
Hence, you need to install Playwright dependencies before running browser tests:

`pnpm exec playwright install`

To create a browser mode test, create a test file using the `.browser.test.*` filename pattern.

In your test file you can import the `render` function from [vitest-browser-react](https://vitest.dev/api/browser/react.html) and use it to mount DOM elements.
The following example shows how to render a simple component.
It is wrapped in the `PackageContextProvider`, that is needed to inject services and properties into the component tree.
The example also demonstrates how to use actual i18n values in the rendered components (for more details see [Use real i18n messages in tests](#Use-real-i18n-messages-in-tests)).

```tsx
import { PackageContextProvider } from "@open-pioneer/test-utils/react";
import { messages, messageLocale } from "open-pioneer:test-support";
import { render } from "vitest-browser-react";
import { SimpleUiComponent } from "./SimpleUiComponent";

it("simple ui component is rendered", async () => {

    const screen = await render(
        <PackageContextProvider messages={messages} locale={messageLocale}>
            <SimpleUiComponent textToShow="rendered successfully" data-testid="uiDiv "/>
        </PackageContextProvider>
    );
    ...
}
```

A full example for a browser test file can be found in the sample package (`sample-package`) in `SimpleUiComponentent.browser.test.tsx`.

It is often more convenient (and faster) to test the React components instead of the complete web component application since there are fewer moving parts and fewer dependencies to mock.
However, testing the final application can be great too for automated acceptance tests etc.

Recommended resources:

- Vitest Browser Mode: https://vitest.dev/guide/browser/#browser-mode
- `vitest-browser-react`: https://vitest.dev/api/browser/react.html
- Our own test utils in `@open-pioneer/test-utils`

## UI Tests (with mocked DOM)

Beside the option to create UI test using the Vitest browser mode, it is also possible to write simple UI tests by simulating a browser environment.

The repository is configured to allow the usage of `happy-dom`, (see [Reference](https://vitest.dev/guide/environment.html)) in your test files using the `.test.*` filename pattern (not `.browser.test.*`).

You can use [@testing-library/react](https://testing-library.com/) to render your UI components.

> NOTE: We recommend using Vitest browser mode as the `happy-dom` support will be removed from the starter repository in the future (deprecated).

## Use real i18n messages in tests

The module `open-pioneer:test-support` provides test support helpers for the importing package, such as the actual i18n messages used when running the package in a Trails app.

It exports `messages`, the i18n messages of the importing package and of all its dependencies.
The record can be passed to the `messages` property of `PackageContextProvider` from `@open-pioneer/test-utils/react`.

The module also exports `messageLocale`, the locale of these messages.

Example usage:

```tsx
// Render a component with the real messages of its package.
import { PackageContextProvider } from "@open-pioneer/test-utils/react";
import { render } from "@testing-library/react"; // or import { render } from "vitest-browser-react";
import { messages, messageLocale } from "open-pioneer:test-support"; // (1)

render(
    // (2)
    <PackageContextProvider messages={messages} locale={messageLocale}>
        <MyComponent />
    </PackageContextProvider>
);
```

- **(1)** Import `messages` and `messageLocale`

- **(2)** Pass the imported `messages` and `messageLocale`to the `PackageContextProvider` so that they are used in the components that are rendered in the test.

By default, the messages are returned in the first locale listed in the `i18n` array of the package's 'build.config.mjs'.
A different locale can be requested with a query, for example:

```js
import { messages, messageLocale } from "open-pioneer:test-support?locale=de";
```

This module is designed to be used in combination with the `@open-pioneer/test-utils` package and can only be imported in tests.

## Test utilities

The package `@open-pioneer/test-utils` provides helpers to test components of an Open Pioneer Trails application:

- The application itself (that is, the web component).
  Web components can be mounted in the DOM and their children can be searched.
- React components with dependencies to services, properties etc.
  Test dependencies and data can be provided in such a way that the component renders into the DOM without any changes to the component's implementation.
- Service instances can be created with test references and properties.

For more details, take a look at that package's `README` and its own tests.
