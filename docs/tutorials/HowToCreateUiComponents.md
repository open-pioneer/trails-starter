# How to create UI components

When developing applications with the Open Pioneer Trails client framework, [React](https://reactjs.org/) can be used to create UI components.
We can also use pre-defined components from the [Chakra UI](https://chakra-ui.com/) framework.

## Documentation

- [React's official documentation](https://reactjs.org/docs/getting-started.html)
- [React's new beta documentation](https://beta.reactjs.org/learn) (which is already excellent)
- [Chakra's component overview](https://chakra-ui.com/docs/components/concepts/overview) (with lots of examples)

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

- **(1)**
  Imports `AppUI` (a React component) from the given module.
- **(2)**
  Specifies `AppUI` as the application's UI. Any kind of React component can be used in this place.

When the application is instantiated, the `AppUI` component will be rendered automatically.

React components are typically developed in `.jsx` or `.tsx` files, which are JavaScript/TypeScript modules with [`JSX`](https://beta.reactjs.org/learn/writing-markup-with-jsx) syntax extensions.
In this case, the app's entire UI is defined in `AppUI.tsx`:

```tsx
// src/apps/empty/AppUI.tsx
// (1)
import { Container, Heading, Text, chakra } from "@chakra-ui/react";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { Greeter, SimpleUiComponent } from "sample-package";

// (2)
export function AppUI() {
    const intl = useIntl();
    const greeter = useService<Greeter>("sample-package.Greeter");
    // (3)
    return (
        <Container>
            <Heading as="h1" size="lg">
                {intl.formatMessage({ id: "heading" })}
            </Heading>
            <Text pt={5}>{intl.formatMessage({ id: "text" })}</Text>
            <Text pt={5}>
                This messages comes from the sample package{"'"}s greeter service: {greeter.greet()}
            </Text>
            <chakra.div mt={5}>
                <SimpleUiComponent textToShow="This text is rendered inside the sample UI-Component 'SimpleUiComponent'"></SimpleUiComponent>
            </chakra.div>
        </Container>
    );
}
```

- **(1)**
  Imports Chakra components used by the app's UI.
  Remember to use `@open-pioneer/chakra-snippets` for imports of chakra snippets (not used in this example).

- **(2)**
  Defines a React component called `AppUI`.
  (Almost) all React components should be defined as functions (either `function ComponentName ...` or `const ComponentName = ...`);

- **(3)**
  This defines the content of the component.
  In this case, Chakra components (e.g. `Container`, `Text`) are used.
  You can also use plain html elements, like `div` or `p`.

    The `intl` object here is used to translate messages into multiple languages (see [How to translate an App](./HowToTranslateAnApp.md)). We will not dive into internationalization (i18n) in this tutorial and use static strings instead.

## Defining new UI components

Defining a new React component is as simple as creating a new function.
For this example, we will create a button that has a `label` and tracks the number of times it has been clicked:

```tsx
// src/apps/empty/AppUI.tsx
import { Button, Container, VStack } from "@chakra-ui/react";
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

- **(1)**
  Defines the new component.
  React components should start with an uppercase letter and take a single parameter (called `props`); in this case `props` can contain a `label` property.

    > **Note**
    > In simple (local) components like this, you could also inline the type definition of `ClickableButtonProps`.
    > If you have many properties, or intend to share your components across modules or packages, using a separate type is strongly recommended.

- **(2)**
  Uses the [`useState`](https://beta.reactjs.org/reference/react/useState) hook to remember the number of types the button has been clicked.

- **(3)**
  Renders the button with the appropriate text and wires up the `onClick` handler.

Now, use the new button from the `AppUI` component:

```tsx
// src/apps/empty/AppUI.tsx
import { Container, Button, VStack } from "@chakra-ui/react";
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

## Embedding images

Images or other static resources from your app or package can usually be imported directly into your source code.
For example, to embed an image called `my-image.png` from the same directory as your React component:

```tsx
import { Image } from "@chakra-ui/react";

// Import image as URL
import myImageUrl from "./my-image.png";

// Later, use the URL in your code
<Image src={myImageUrl} />;
```

This works because Vite supports [importing static asserts](https://vite.dev/guide/assets).
It will support the import during development and automatically bundle your assets when building your app.

Notes:

- Depending on your Vite configuration, small files may be embedded as base64 strings. In this case, no actual assets will be emitted.
- If you intend to publish your code as a trails package, you should also list your files as assets (see [`publishConfig.assets`](../reference/Package.md#publishconfigassets)).

## Defining a UI Component in a different module

Since react components are simple functions (or sometimes classes), they can be simply be moved into another file in combination with the usual `import` and `export` keywords.

Moving a component into a shared package is just as simple: just export the component (and its `props` type, if using TypeScript) from the package, for example from the `index.ts[x]`.

## Interacting with the rest of the system

React `props` are a powerful system that can handle arbitrary values such as strings (like in the example above), but also functions (e.g. event handlers or [_render props_](https://beta.reactjs.org/reference/react/cloneElement#passing-data-with-a-render-prop)).
However, props work only from parent to child, which can be tedious with deeply nested component trees.

React has a second system (the [`Context API`](https://beta.reactjs.org/reference/react/useContext)) that can be used to inherit values into all children (and their children etc.) of a certain component.
This can be extremely powerful but also makes components harder to understand.

We have implemented hooks such as `useService` and `useIntl` (built on top of the context API) to allow React components to interact with the rest of the framework (see [How to use a service](./HowToUseAService.md) and [How to translate an app](./HowToTranslateAnApp.md)).

It is best to compose a UI from a set of simple, reusable React components that mostly rely on `props` and hooks.
This makes them easier to understand, to reuse and to test in isolation.
More powerful mechanisms should only be used when those simple approaches are not sufficient anymore.

## Keeping shared state

Like mentioned above, simple state can often be managed through props and component-local state.

Plain services (together with events) can be used to keep state that is used in multiple places (components, services) of the application.

To manage more complex state, React developers usually reach for a state management library (e.g. Redux or Zustand).
We have implemented a custom state management solution based on signals (see [Reactivity-API](https://github.com/conterra/reactivity/), [Trails bindings for React](https://github.com/open-pioneer/trails-core-packages/tree/main/src/packages/reactivity)).
This API is used for reactive interfaces provided by Trails packages and will probably fit your needs as well.
A relatively complete example is available [here](https://github.com/open-pioneer/trails-openlayers-base-packages/blob/main/src/samples/map-sample/ol-app/README.md#state-management).

Other third party libraries that work well, too:

- [Zustand](https://github.com/pmndrs/zustand)
- [Jotai](https://jotai.org/)
- [Valtio](https://github.com/pmndrs/valtio)
