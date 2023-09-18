# Theming

When developing Open Pioneer Trails applications [React](https://reactjs.org/) can be
used to create UI components.
However, we can also use pre-defined components from the Chakra UI framework which might
be the usual approach. Chakra UI comes with a theming mechanism that is re-used in tails
to provide a theming mechanism.

In the following, the approach how theming is re-used in trails is explained.
To get an example of how to create a theme for your app, refer to
[How To Theme An App](../tutorials/HowToThemeAnApp.md).

The basic principles, functionalities, parameters and configuration of Chakra UI's theming
capabilities are described in the [official documentation](https://chakra-ui.com/docs/styled-system/theme).
The principle of how theming is applied to components works similarly to CSS: multiple themes
can be defined which complement or override each other.
It is also possible to make attribute-based definitions directly on the components in a `.jsx`/`.
tsx` file. These attributes have (like inline CSS) precedence over previously defined themes.

A multi-level theming approach is used for Open Pioneer Trials apps. There are two internal levels
of theming and a third level for an app-specific custom theme.
The first level is Chakra UI's default theme which defines the _default look_ of Chakra UI
components and is part of Chakra UI. The second internal layer is the Trials base theme which
is part of the Trials Core Packages.
It defines common variables ([semantic tokens](https://chakra-ui.com/docs/styled-system/component-style))
and basic styling and variants for Chakra components (e.g. button with multiple variants).
The Trials base theme will be extended in future releases of the Trials Core Packages.
The third level of theming is a custom theme that can optionally be passed to a Trials app.
The custom theme has precedence over the Chakra default theme and the Trials base theme.
The Chakra default theme has always the lowest priority while the Trials base theme
or the custom theme (if provided) have higher priority.

It is not encouraged to make use of (inline) attribute definitions (especially colors)
since it is not possible to override these definition with a custom theme.
Though, Chakra theming allows to define multiple [variants](https://chakra-ui.com/docs/styled-system/component-style)
of a component (e.g. submit button and cancel button) individual styling of certain
elements has to be done with CSS.

The [`Sample UI`](https://github.com/open-pioneer/trails-core-packages/tree/main/src/samples/chakra-sample/chakra-app)
app in the Trials Core packages provides an example for a custom theme.
