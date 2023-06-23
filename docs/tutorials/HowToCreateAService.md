# How to create a service

This tutorial will demonstrate some more advanced topics related to the creation of services.
We recommend reading the simpler [How to use a service](./HowToUseAService.md) tutorial first.

## Creating the service class

In this section, we will create a `MathService` in a new package.

First, create the directory `src/packages/math` with the following required package files (see also [Package reference](../reference/Package.md)):

```js
// src/packages/math/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({});
```

```jsonc
// src/packages/math/package.json
{
    "name": "math",
    "private": true
}
```

The service's implementation is trivial.
It provides a simple method to the users that multiplies two numbers:

```ts
// src/packages/math/MathServiceImpl.ts
export class MathServiceImpl {
    multiply(a: number, b: number): number {
        return a * b;
    }
}
```

We must export it from the `services.ts` (or `.js`) so it can be found by the framework later:

```ts
// src/packages/math/services.ts
export { MathServiceImpl } from "./MathServiceImpl";
```

> **Note**  
> The file name `MathServiceImpl.ts` is arbitrary. Only the export from the `services.ts` matters here.

Now, declare the service in your `build.config.mjs`.
We provide the single interface `"math.MathService"`:

```js
// src/packages/math/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        MathServiceImpl: {
            provides: "math.MathService"
        }
    }
});
```

> **Note**  
> A service can provide many interfaces at the same time.
> See [Service reference](../reference/Services.md) and [Package reference](../reference/Package.md).

## Testing the service

We will create a simple unit test that calls the `multiply` method.
The test framework [Vitest](https://vitest.dev/) is preconfigured in this repository.
It will automatically pick up all `*.test.*` files in all packages and execute their tests (see also [How to write tests](./HowToWriteTests.md)).

Before creating the test, add `@open-pioneer/test-utils` to your package's `devDependencies`.
The test-utils package contains helpers for testing service classes:

```jsonc
// src/packages/math/package.json
{
    "name": "math",
    "private": true,
    "devDependencies": {
        "@open-pioneer/test-utils": "^1.0.0"
    }
}
```

After that, execute `pnpm install`:

```bash
$ pnpm install
```

Now create the test file:

```ts
// src/packages/math/MathServiceImpl.test.ts
import { it, expect } from "vitest";
import { createService } from "@open-pioneer/test-utils/services";
import { MathServiceImpl } from "./MathServiceImpl";

it("multiplies two numbers", async () => {
    const service = await createService(MathServiceImpl);
    expect(service.multiply(3, 4)).toEqual(12);
});
```

The test creates a new service instance by calling the `createService` helper and then tests the result of `multiply(...)` by using Vitest's [`expect` API](https://vitest.dev/api/expect.html).

We can run `pnpm test` to execute all tests in this repository, which is Vitest's default behavior.
For this example, we will only execute tests in the `math` directory for the sake of simplicity:

```bash
$ pnpm test  src/packages/math
# > starter@ test <PROJECT_DIR>
# > vitest "src/packages/math"
#
#
#  DEV  v0.28.5 <PROJECT_DIR>/src
#
#  ✓ packages/math/MathServiceImpl.test.ts (1)
#
#  Test Files  1 passed (1)
#       Tests  1 passed (1)
#    Start at  12:15:10
#    Duration  1.98s (transform 1.33s, setup 0ms, collect 1.35s, tests 16ms)
```

## Using the service

We will also add our first 'real' use of the service by editing the `empty` app.

First, add the package `math` in the app's `package.json`:

```jsonc
// src/apps/empty/package.json
{
    "name": "empty",
    "private": true,
    "peerDependencies": {
        "@open-pioneer/runtime": "^1.0.0",
        "@open-pioneer/chakra-integration": "^1.0.0",
        "math": "workspace:^"
    }
}
```

Then, run `pnpm install` to update the package's node_modules directory.

In the `build.config.mjs`, add a reference from the UI to the interface `"math.MathService"`:

```js
// src/apps/empty/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    ui: {
        references: ["math.MathService"]
    }
});
```

In the app's UI, we call the service when a button is pressed by the user:

```tsx
import {
    Button,
    Container,
    HStack,
    NumberInput,
    NumberInputField,
    Text,
    VStack
} from "@open-pioneer/chakra-integration";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";

export function AppUI() {
    const [leftValue, setLeftValue] = useState(3);
    const [rightValue, setRightValue] = useState(4);
    const [result, setResult] = useState<number | undefined>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = useService("math.MathService") as any; // (1)
    const onMultiplyClicked = () => {
        setResult(service.multiply(leftValue, rightValue)); // (2)
    };

    return (
        <Container>
            <VStack>
                <Text>Multiply two numbers:</Text>
                <HStack>
                    <NumberInput
                        value={leftValue}
                        onChange={(_, valueAsNumber) => setLeftValue(valueAsNumber)}
                    >
                        <NumberInputField />
                    </NumberInput>
                    <NumberInput
                        value={rightValue}
                        onChange={(_, valueAsNumber) => setRightValue(valueAsNumber)}
                    >
                        <NumberInputField />
                    </NumberInput>
                    <Button onClick={onMultiplyClicked}>Multiply!</Button>
                </HStack>
                <Text>The result is: {result}</Text>
            </VStack>
        </Container>
    );
}
```

-   **(1)**
    Retrieves the reference to our math service. Note that we are currently casting to `any` here: this is because the interface name has not been associated with a type yet. We will do that later.

    _Do not_ use the actual class name (`MathServiceImpl`) here, since that is private to the package and may contain additional implementation details.
    When using a private service (e.g. inside the same package), using that class would be okay.

-   **(2)**
    Calls the `multiply` method on the service.
    This callback is triggered by the `<Button>` element.
    The result is stored into the component's state via `setResult()` and will be displayed by the bottommost `<Text>` element.

Your UI should look like this:

![Multiplication UI](./HowToCreateAService_UI.png)

## Integrating with TypeScript

This section is optional when you're mainly using JavaScript or if your service is private to your package.
If you plan to have your service used by others, providing good TypeScript integration is highly recommended.

Back in the `math` package, we will define the public interface for `"math.MathService"`.
Pure interface descriptions are conventionally placed into a file called `api.ts`, but they should also be exported from the package's `main` entry point for convenience.

Because we do not intend to export any classes, functions or constants, we'll just make `api.ts` our `main` for now:

```jsonc
// src/packages/math/package.json
{
    "name": "math",
    "private": true,
    "main": "api.ts",
    "devDependencies": {
        "@open-pioneer/test-utils": "^1.0.0"
    }
}
```

The `api.ts` contains an interface definition and registers that interface with the interface name `"math.MathService"`:

```ts
// src/packages/math/api.ts
/**
 * Provides math operations.
 *
 * Use the interface `"math.MathService"` to inject an instance of this service.
 */
export interface MathService {
    /**
     * Multiplies the two numbers and returns the result.
     */
    multiply(a: number, b: number): number;
}

import "@open-pioneer/runtime";
declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "math.MathService": MathService; // (1)
    }
}
```

-   **(1)**  
    This associates the interface name with the given type.
    Whenever one writes `useService("math.MathService")` or `ServiceType<"math.MathService">`, one will now automatically receive the type `MathService` defined here.

    This means that we can now also remove the `as any` cast in `AppUI.tsx`.

Finally, now that we have an interface, we'll also implement it in our service class:

```ts
// src/packages/math/MathServiceImpl.ts
import { MathService } from "./api";

export class MathServiceImpl implements MathService {
    multiply(a: number, b: number): number {
        return a * b;
    }
}
```

## Referencing all services that provide a certain interface

Services have the powerful capability to gather all services that provide a certain interface name
by specifying `all: true` in the `build.config.mjs`.

This can be used, for example, to implement an extension API: a user may add its own services into the inner workings of another service by providing an interface.

This section demonstrates how to do that by adding a simple extension API to the `MathService`: clients will be called whenever someone triggers a call to `multiply`.

This time, we will start with the TypeScript integration.

### Creating the TypeScript API for the new interface

In your `api.ts`, add another interface:

```ts
// src/packages/math/api.ts
// ...
/**
 * An extension to the math service.
 * Implementors are notified by the math service whenever a computation was triggered.
 *
 * Provide the interface `"math.MathServiceExtension"` to be called by the math service.
 */
export interface MathServiceExtension {
    /** Called when `multiply` was called on the math service. */
    onMultiply(a: number, b: number, result: number): void;
}

import "@open-pioneer/runtime";
declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        // ...
        "math.MathServiceExtension": MathServiceExtension;
    }
}
```

### Gathering and using all services providing the interface

In the configuration file, we gather all services providing that extension interface:

```js
// src/packages/math/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        MathServiceImpl: {
            provides: "math.MathService",
            references: {
                // Injects all implementations of that interface as an `extensions` array
                extensions: {
                    name: "math.MathServiceExtension",
                    all: true
                }
            }
        }
    }
});
```

On the implementation side, we now use the constructor argument of type `ServiceOptions`.
This argument is automatically created by the framework when the service is instantiated.
`options.references` contains the array of extensions we've requested in the `build.config.mjs`:

```ts
// src/packages/math/MathServiceImpl.ts
import { ServiceOptions } from "@open-pioneer/runtime";
import { MathService, MathServiceExtension } from "./api";

interface References {
    extensions: MathServiceExtension[];
}

export class MathServiceImpl implements MathService {
    private extensions: MathServiceExtension[];

    constructor({ references }: ServiceOptions<References>) {
        this.extensions = references.extensions; // (1)
    }

    multiply(a: number, b: number): number {
        const result = a + b;
        for (const ext of this.extensions) {
            ext.onMultiply(a, b, result); // (2)
        }
        return result;
    }
}
```

-   **(1)** Saves the array of references in our service instance.
-   **(2)** Forwards the arguments and the result to each extension.

### Updating the tests

If you left `vitest` running, you will have noticed that our original test is failing.
This is because our test code does not provide the `extensions` array and therefore throws an error when attempting to iterate it in `multiply()`.

We will update the test with an empty array and, while we're at it, add a test for the new feature:

```ts
// src/packages/MathServiceImpl.test.ts
import { it, expect } from "vitest";
import { createService } from "@open-pioneer/test-utils/services";
import { MathServiceImpl } from "./MathServiceImpl";

it("multiplies two numbers", async () => {
    const service = await createService(MathServiceImpl, {
        references: {
            // (1)
            extensions: []
        }
    });
    expect(service.multiply(3, 4)).toEqual(12);
});

it("invokes the extensions when a multiplication is triggered", async () => {
    interface Event {
        from: string;
        a: number;
        b: number;
        result: number;
    }

    const events: Event[] = [];
    const service = await createService(MathServiceImpl, {
        references: {
            // (2)
            extensions: [
                {
                    onMultiply(a, b, result) {
                        events.push({
                            from: "first",
                            a,
                            b,
                            result
                        });
                    }
                },
                {
                    onMultiply(a, b, result) {
                        events.push({
                            from: "second",
                            a,
                            b,
                            result
                        });
                    }
                }
            ]
        }
    });

    // (3)
    service.multiply(4, 3);
    expect(events).toEqual([
        { from: "first", a: 4, b: 3, result: 12 },
        { from: "second", a: 4, b: 3, result: 12 }
    ]);
});
```

-   **(1)**
    Our original test now receives an empty array for `extensions`.
-   **(2)**
    Our new test contains two mocked extensions that simply write their arguments into a shared array.
-   **(3)**
    We call `multiply` and check that our extensions have been invoked by asserting the contents of the `events` array.

#### Implementing an actual service providing the interface

Now we will implement an extension class that simply logs all arguments to demonstrate that the system works as expected. Like before, we'll use the empty app to do this.

In your `package.json`, add a dependency to `@open-pioneer/core`.
We want to use its logger implementation:

```jsonc
// src/apps/empty/package.json
{
    "name": "empty",
    "private": true,
    "peerDependencies": {
        "@open-pioneer/chakra-integration": "^1.0.0",
        "@open-pioneer/core": "^1.0.0",
        "@open-pioneer/runtime": "^1.0.0",
        "math": "workspace:^"
    }
}
```

Then, execute `pnpm install` to update your app's dependencies.

In the `build.config.mjs`, declare a new service providing `"math.MathServiceExtension"`:

```js
// src/apps/empty/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    ui: {
        references: ["math.MathService"]
    },
    services: {
        LoggingMathExtension: {
            provides: ["math.MathServiceExtension"]
        }
    }
});
```

For this example, we'll implement the class directly in the `services.ts`:

```ts
// src/apps/empty/services.ts
import { MathServiceExtension } from "math";
import { createLogger } from "@open-pioneer/core";

const LOG = createLogger("empty-app");

export class LoggingMathExtension implements MathServiceExtension {
    onMultiply(a: number, b: number, result: number): void {
        LOG.info(`${a} * ${b} = ${result}`);
    }
}
```

Restart the empty app in your browser, open the console and click the "Multiply!" button.
Your console should display a message just like this:

![Log message from extension](./HowToCreateAService_LogMessage.png)

## A note on service start behavior

By default the framework will only start services that are actually required to run the app.
It does so by starting the services required by the user interface (`ui.references` in each package's `build.config.mjs`)
or those required to implement the web component's API (`integration.ApiExtension`), their dependencies, _their_ dependencies and so on.
An application may therefore contain services that are never required and thus never started (they might even be optimized out entirely in the future).

### Service AutoStart

Some services should start as soon as their package is part of an application, for example to perform some side effect in the service's constructor.

The preferred way to achieve this is to provide the `runtime.AutoStart` interface:

```js
// build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        YourService: {
            provides: ["runtime.AutoStart"] // (1)
        }
    }
});
```

By providing the interface in (1), the framework will automatically instantiate your service.
Of course you can still provide any other interfaces just like usual.

> NOTE: Services providing `runtime.AutoStart` are launched in arbitrary order.
> If you need to enforce starting order, add a dependency to the service(s) that must start
> before yours does.

If you're curious: the framework still only starts referenced services.
It just has an implicit dependency on all services implementing `runtime.AutoStart`, thus triggering their instantiation.

## Further reading

Some service features have not been touched in this tutorial.
For example, you can translate messages within a service by using the `intl` object in the constructor's `ServiceOptions` object.
All details are documented in the [Services reference](../reference/Services.md) and in the [Package reference](../reference/Package.md).
