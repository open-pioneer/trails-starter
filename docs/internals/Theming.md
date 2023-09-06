(The theming capabilities for Open Pioneer Trails are not yet available. Theming will be included in a future release of the Trails Core Packages)
# Theming
Theming allows to set the color scheme, fonts and font sizes for an app or for certain component types (e.g. Button, Selection...) in an app. 
It is also possible to define the (default) size of certain components like buttons in an app. The exact shape and placement of individual elements in an app is not part of theming.
## Overview
Open Pioneer Trails uses the UI components of the [Chakra UI](https://chakra-ui.com/) library. The theming therefore uses the theming capabilities which are already provided by Chakra UI.
The basic principles, functionalities, parameters and configuration of Chakra UI's theming capabilites are described in the [official documentation](https://chakra-ui.com/docs/styled-system/theme).
The principle of how theming is applied to components works similarly to CSS: multiple themes can be defined which complement or override each other.
It is also possible to make attribute-based definitions directly on the components in a `.jsx`/`.tsx` file. These attributes have (like inline CSS) precedence over previously defined themes.

A multi-level theming approach is used for Open Pioneer Trials apps. There are two internal levels of theming and a third level for an app-specific custom theme.
The first level is Chakra UI's default theme which defines the *default look* of Chrakra UI components and is part of Chakra UI. The second internal layer is the Trials base theme which is part of the Trials Core Packages.
It defines common variables ([semantic tokens](https://chakra-ui.com/docs/styled-system/component-style)) and basic styling and variants for Chakra components (e.g button with multiple variants). The Trials base theme will be extended in future releases of the Trials Core Packages.
The third level of theming is a custom theme that can optionally be passed to a Trials app. The custom theme has precedence over the Chakra default theme and the Trials base theme. The Chakra default theme has always the lowest priority while the Trials base theme or the custom theme (if provided) have higher priority.

It is not encouraged to make use of (inline) attribute definitions (especially colors) since it is not possible to override these definition with a custom theme. 
Though, Chakra theming allows to define multiple [variants](https://chakra-ui.com/docs/styled-system/component-style) of a component (e.g. submit button and cancel button) individual styling of certain elements has to be done with CSS.

The [`Sample UI`](https://github.com/open-pioneer/trails-core-packages/tree/main/src/samples/chakra-sample/chakra-app) app in the Trials Core packages provides an example for a custom theme.

## Provide a custom theme for an app
The theme is provided to the `createCustomElement` function from `@open-pioneer/runtime`. The interface `CustomElementOptions` defines an optinal `theme` parameter. The parameter takes an object which is the chakra theming object. Its structure has to be as specified in the [Chakra documentation](https://chakra-ui.com/docs/styled-system/theme).
```Typescript
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { SampleUI } from "./SampleUI";
import { theme } from "./theme/theme";

const Element = createCustomElement({
    component: SampleUI,
    theme: theme,
    appMetadata
});

customElements.define("chakra-app", Element);
```
