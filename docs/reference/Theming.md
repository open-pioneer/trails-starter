# Theming

When developing Open Pioneer Trails applications, arbitrary [React](https://reactjs.org/) components can be used to create the user interface.
However, we mostly use pre-defined components from the Chakra UI framework.
Chakra UI comes with a theming mechanism that is re-used in Open Pioneer Trails and briefly explained here.

To get an example of how to create a theme for your app, refer to [How To Theme An App](../tutorials/HowToThemeAnApp.md).

The basic principles, functionalities, parameters and configuration of Chakra UI's theming
capabilities are described in the [official documentation](https://chakra-ui.com/docs/styled-system/theme).
The principle of how theming is applied to components works similarly to CSS: multiple themes
can be defined which complement or override each other.
It is also possible to make attribute-based definitions directly on the components in a `.jsx`/`.tsx` file.
These attributes have (like inline CSS) precedence over previously defined themes.

A multi-level theming approach is used for Open Pioneer Trails apps.
There are two internal levels of theming and a third level for an app-specific custom theme.

The first level is Chakra UI's default theme which defines the _default look_ of Chakra UI
components and is part of Chakra UI.

The second internal level is the Trails base theme which is part of the Trails core packages.
It defines common variables ([semantic tokens](https://chakra-ui.com/docs/styled-system/component-style))
and a default color scheme that is used as a default color scheme for all Chakra UI components.
This theme is active by default in Trails applications, but it is also designed to be extended.
Most custom themes are expected to extend this theme (via Chakra's `extendTheme()` function) while making only minor adjustments.
The Trails base theme will be extended in future releases of the Trails core packages.

The third level of theming is a custom theme that can be passed to a Trails app via the optional `theme` option in `createCustomElement`.
When specified, the custom theme replaces the Trails base theme as the application's active theme.
However, if the custom theme extends from the base theme (which is recommended), the parts of the base theme that were not overridden will still be active.

We recommend against making use of (inline) attribute definitions (especially colors) since it is not possible to override these definition with a custom theme.

Chakra's theming mechanism allows _global_ changes to all components (within an application), or to single component [variants](https://chakra-ui.com/docs/styled-system/component-style).
Changes to the theme will therefore always affect multiple component instances.
To style _specific_ elements in a different way, the developer has to use CSS rules or inline styles.

The [`Sample UI`](https://github.com/open-pioneer/trails-core-packages/tree/main/src/samples/chakra-sample/chakra-app)
app in the Trails core packages provides an example for a custom theme.
