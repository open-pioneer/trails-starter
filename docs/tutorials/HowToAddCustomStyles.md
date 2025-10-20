# How to add custom styles

In this example, we will enhance the empty app (at `src/apps/empty`) to include custom css rules.
We intend to add a custom class to the app's container and define that class in a `.css` file.

> **Note**  
> The same technique can be applied to every other package in this repository (app or package).

## Distributing styles with your package

To begin, start the development server and open the empty app:

```bash
pnpm run dev
```

Open the `build.config.mjs` and declare the `styles` property:

```js
// src/apps/empty/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: ["en"],
    styles: "./styles.css",
    ui: {
        references: ["sample-package.Greeter"]
    }
});
```

The framework will automatically gather all css rules of packages that declare `styles` and distribute them with your application.
After hitting save, you will now get an (expected) error in your browser, since the file does not yet exist.

Now create it:

```css
/* src/apps/empty/styles.css */

.empty-app-container {
    background-color: hotpink;
    color: white;
}
```

After reloading your browser, the previous error will be gone.
However, since the class isn't being used, your UI still looks the same.
Setting the css class of a React element is done via the `className` prop:

```tsx
import { Container, Heading, Text } from "@chakra-ui/react";

export function AppUI() {
    const intl = useIntl();
    const greeter = useService<Greeter>("sample-package.Greeter");
    return (
        <Container className="empty-app-container">
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

Now hit save.
Your browser should show the new styles immediately:

![Styles have been applied](./HowToAddCustomStyles_StylesApplied.png)

### Support for SCSS

You can also use [SCSS](https://sass-lang.com/) to develop your stylesheets.

For example:

```js
// src/apps/empty/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: ["en"],
    styles: "./styles.scss", // Note the .scss extension
    ui: {
        references: ["sample-package.Greeter"]
    }
});
```

The following scss file is equivalent to the css file from above:

```scss
/* src/apps/empty/styles.scss */

.empty-app {
    &-container {
        background-color: hotpink;
        color: white;
    }
}
```

## Advanced styling

### Hot reloading

Changing the content of your package's css files will automatically apply those changes _without_ reloading the app (hot update).

### CSS imports

You can use [CSS imports](https://developer.mozilla.org/en-US/docs/Web/CSS/@import) to split large files or to integrate external libraries.
Imports will be resolved by the framework and contents will be merged without any impact on production performance.

Example:

```css
/* Imports a package-local file. */
@import "./other/css/file.css";

/* This is how the open layers styles are included internally (imports from `ol` package). */
@import "ol/ol.css";
```

### Applying styles to your UI Components

This section contains a few hints and examples for different ways to style your UI components.

#### Chakra UI

Chakra UI already provides different concepts for styling (see [styling documentation](https://chakra-ui.com/docs/styling/overview)).

Especially useful is the very large set of style properties to customize single components: [Style props documentation](https://chakra-ui.com/docs/styling/overview#style-props).

Helpful is also the `css` prop which allows to apply css rules directly to a component. Examples:

```tsx
import { Box, Text } from "@chakra-ui/react";

export function AppUI() {
    return (
        <Box>
            {/* Simple example: increase font size of a text element*/}
            <Text css={{ "font-size": "25px" }}>This is an text.</Text>
        </Box>
    );
}
```

```tsx
import { Box } from "@chakra-ui/react";

export function AppUI() {
    return (
        <Box
            css={{
                // match against data attributes (or other html attributes)
                "&[data-open='true']": {
                    fontSize: "25px"
                },
                // you can also style children of this element
                "& .some-class": {
                    fontSize: "50px"
                }
            }}
        ></Box>
    );
}
```

Additionally, Chakra provides extensive theming support ([Documentation](https://chakra-ui.com/docs/theming/overview)).
It is possible to create a custom theme for an app. For details see [How To Theme An App](./HowToThemeAnApp.md).

#### React classes

React supports the `className` prop to set an element's css classes as a string ([Documentation](https://reactjs.org/docs/faq-styling.html)).

The popular [`classnames`](https://www.npmjs.com/package/classnames) packages can be used to assemble the `className` prop from multiple, potentially dynamic inputs:

```tsx
import classNames from "classnames";

export function AppUI() {
    return (
        <div className={classNames("foo", "bar", { baz: false, qux: 5 * 2 === 10 })}>
            <h1>Hello world</h1>
        </div>
    );
}
```

The `div` will have the css classes `foo`, `bar` and `qux` but not `baz`, because it has been set to false.

#### React inline styles

You can also use React's builtin support for the `style` property.
Styles defined this way appear as inline styles directly on the DOM element:

```tsx
export function AppUI() {
    return (
        <div>
            <h1 style={{ padding: "10px 20px", textAlign: "center", color: "green" }}>Header</h1>
        </div>
    );
}
```

Inline styles have a lot of downsides (maintainability, performance, no reuse) but they can sometimes be appropriate to apply dynamic styles.
