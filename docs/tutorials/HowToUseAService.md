# How to use a service

Services are one of the central mechanisms of code sharing in an open pioneer client application.
Instead of using global variables (or singletons), services are started per-application instance.

Builtin dependency injection support allows services to declare their dependencies.
The framework automatically starts all required services in their correct order and injects references where needed.

Services can be used from other services or from UI components.

## Using a service from a React component

In this section, we will customize the `empty` app's UI (in `src/apps/empty`).
Our objective is to add a custom CSS class to the application's root `div` from our React UI.

To obtain a reference to the root `div`, we need the service implementing `"runtime.ApplicationContext"`.
Thus, we edit our app's `build.config.mjs`:

```js
// src/apps/empty/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    ui: {
        references: ["runtime.ApplicationContext"]
    }
});
```

React components can use [hooks](https://reactjs.org/docs/hooks-intro.html) to interact with the pioneer framework, one of which is the `useService` hook used below:

```tsx
// src/apps/empty/AppUI.tsx
import { Container, Heading, Text } from "@open-pioneer/chakra-integration";
import { useService } from "open-pioneer:react-hooks";
import { useEffect } from "react";

const CLASS_NAME = "my-custom-class";

export function AppUI() {
    // (1)
    const appCtx = useService("runtime.ApplicationContext");

    // (2)
    useEffect(() => {
        const div = appCtx.getApplicationContainer();
        div.classList.add(CLASS_NAME);

        // (3)
        return () => div.classList.remove(CLASS_NAME);
    }, [appCtx]);

    return (
        <Container>
            <Heading as="h1" size="lg">
                Empty App
            </Heading>
            <Text>This is an empty app.</Text>
        </Container>
    );
}
```

-   **(1)**
    Fetches a reference to the service.
-   **(2)**
    Uses the [`useEffect`](https://reactjs.org/docs/hooks-effect.html) to perform a side effect when the component is mounted.
    We add a single class to the application's container-`div`.

    > **Note**
    > This is just an example to demonstrate a side effect. Adding a class to the container `div` is usually not needed.

-   **(3)**
    We return a cleanup function: this will be called by react to revert the side effect in the `useEffect` hook. Forgetting to return cleanup function is a frequent error when using effects.

The custom class will now be present when you inspect your app:

![Custom class on application container](./HowToUseAService_CustomClass.png)

## Using a service from another service

TODO

## Further reading

-   TODO: How to create a service
