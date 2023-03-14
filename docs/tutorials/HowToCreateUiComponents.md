# How to create UI components

When developing applications with the open pioneer client framework, [React](https://reactjs.org/) can be used to create UI Components.
We can also use pre-defined components from the [Chakra UI](https://chakra-ui.com/) framework.

## Documentation

-   [React's official documentation](https://reactjs.org/docs/getting-started.html)
-   [React's new beta documentation](https://beta.reactjs.org/learn) (which is already excellent)
-   [Chakra's component overview](https://chakra-ui.com/docs/components) (with lots of examples)

## Getting started

In this tutorial, we will take the empty app (`src/apps/empty`) as a starting point.

Start your dev server (by running `pnpm dev`) and open the empty app in your browser (usually at <http://localhost:5173/sites/empty/>).

The app's main entry point (`app.ts`) creates and defines a custom element class (from the Web Component standard, see [MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)), including the app's user interface:

```ts
// src/apps/empty/app.ts
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI"; // (1)

const Element = createCustomElement({
    component: AppUI, // (2)
    appMetadata
});

customElements.define("empty-app", Element);
```

-   **(1)**
    Imports `AppUI` (a React component) from the given module.
-   **(2)**
    Specifies `AppUI` as the application's UI. Any kind of react component can be used in this place.

When the application is instantiated, the `AppUI` component will be rendered automatically.

React components are typically developed in `.jsx` or `.tsx` files, which are JavaScript/TypeScript modules with [`JSX`](https://beta.reactjs.org/learn/writing-markup-with-jsx) syntax extensions.
In this case, the app's entire UI is defined in `AppUI.tsx`:

```tsx
// src/apps/empty/AppUI.tsx
// (1)
import { Container, Heading, Text } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";

// (2)
export function AppUI() {
    const intl = useIntl();
    // (3)
    return (
        <Container>
            <Heading as="h1" size="lg">
                {intl.formatMessage({ id: "heading" })}
            </Heading>
            <Text>{intl.formatMessage({ id: "text" })}</Text>
        </Container>
    );
}
```

-   **(1)**
    Imports Chakra components used by the app's UI.

    > **Note**  
    > Remember to use `@open-pioneer/chakra-integration` for imports instead of `@chakra-ui/react`.
    > The `chakra-integration` package ensures a common version of the Chakra framework and also contains a few fixes we had to make for web component support.
    > All chakra components are available from `@open-pioneer/chakra-integration`.

-   **(2)**
    Defines a React component called `AppUI`.
    (Almost) all React components should be defined as functions (either `function ComponentName ...` or `const ComponentName = ...`);

-   **(3)**
    This defines the content of the component.
    In this case, Chakra components (e.g. `Container`, `Text`) are used.
    You can also use plain html elements, like `div` or `p`.

    The `intl` object here is used to translate messages into multiple languages (see [How to translate an App](./HowToTranslateAnApp.md)). We will not dive into internationalization (i18n) in this tutorial and use static strings instead.

## Defining new UI components

Defining a new react component is as simple as creating a new function.
For this example, we will create a button that has a `label` and tracks the number of times it has been clicked:

```tsx
// src/apps/empty/AppUI.tsx
import { Button, Container, VStack } from "@open-pioneer/chakra-integration";
import { useState } from "react";

// function AppUI ...

interface ClickableButtonProps {
    label: string;
}

// (1)
function ClickableButton({ label }: ClickableButtonProps) {
    // (2)
    const [clickCount, setClickCount] = useState(0);
    const incrementClickCount = () => {
        setClickCount(clickCount + 1);
    };

    // (3)
    const clickText = clickCount === 0 ? "" : `(${clickCount})`;
    return (
        <Button onClick={incrementClickCount}>
            {label} {clickText}
        </Button>
    );
}
```

-   **(1)**
    Defines the new component.
    React components should start with an uppercase letter and take a single parameter (called `props`); in this case `props` can contain a `label` property.

    > **Note**
    > In simple (local) components like this, you could also inline the type definition of `ClickableButtonProps`.
    > If you have many properties, or intend to share your components across modules or packages, using a separate type is strongly recommended.

-   **(2)**
    Uses the [`useState`](https://beta.reactjs.org/reference/react/useState) hook to remember the number of types the button has been clicked.

-   **(3)**
    Renders the button with the appropriate text and wires up the `onClick` handler.

Now, use the new button from the `AppUI` component:

```tsx
// src/apps/empty/AppUI.tsx
import { Button, Container, VStack } from "@open-pioneer/chakra-integration";
import { useState } from "react";

export function AppUI() {
    return (
        <Container>
            <VStack>
                <ClickableButton label="First" />
                <ClickableButton label="Second" />
            </VStack>
        </Container>
    );
}

// interface ClickableButtonProps ...
```

The final result looks like this (after a clicking a few times):

![Buttons with click count](./HowToCreateUiComponents_Buttons.png)

## Defining a UI Component in a different module

Since react components are simple functions (or sometimes classes), they can be simply be moved into another file in combination with the usual `import` and `export` keywords.

Moving a component into a shared package is just as simple: just export the component (and its `props` type, if using TypeScript) from the package, for example from the `index.ts[x]`.

## Interacting with the rest of the system

React `props` are a powerful system that can handle arbitrary values such as strings (like in the example above), but also functions (e.g. event handlers or [_render props_](https://beta.reactjs.org/reference/react/cloneElement#passing-data-with-a-render-prop)).
However, props work only from parent to child, which can be tedious with deeply nested component trees.

React has a second system (the [`Context API`](https://beta.reactjs.org/reference/react/useContext)) that can be used to inherit values into all children (and their children etc.) of a certain component.
This can be extremely powerful but also makes components harder to understand.

We have implemented hooks such as `useService` and `useIntl` (built on top of the context API) to allow react components to interact with the rest of the framework (see [How to use a service](./HowToUseAService.md) and [How to translate an app](./HowToTranslateAnApp.md)).

It is best to compose a UI from a set of simple, reusable React components that mostly rely on `props` and hooks.
This makes them easier to understand, to reuse and to test in isolation.
More powerful mechanisms should only be used when those simple approaches are not sufficient anymore.

## Keeping shared state

Like mentioned above, simple state can often be managed through props and component-local state.

Plain services (together with events) can be used to keep state that is used in multiple places (components, services) of the application.

To manage more complex state, React developers usually reach for a state management library (e.g. Redux).
[Zustand](https://github.com/pmndrs/zustand), [Jotai](https://jotai.org/) or [Valtio](https://github.com/pmndrs/valtio) appear to be rather simple to integrate but we have not used them yet.
A service could create a central "store" instance to be shared with other services and the UI.
Let us know if you need this feature.
