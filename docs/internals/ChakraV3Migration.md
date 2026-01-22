# Migration to Chakra V3

This document contains a collection of resources that may help you adapt your app to Chakra V3.

## Getting started

If you are new to Chakra UI v3, start with the [official documentation](https://chakra-ui.com/docs/components/concepts/overview).

## Migration

### Overview

Chakra UI v3 is essentially a complete rewrite of Chakra UI v2, with many improvements and breaking changes.
When you're starting a new project, you can take advantage of the larger set (and higher quality) of available components.
When migrating existing UI code from v2 to v3, you will likely have to visit every line of every component.

Chakra UI v2 was a monolithic library based on Emotion and React.
The code of every component was directly available in the Chakra UI package.
With version 3, the Chakra team has separated their package into multiple layers:

- [Zag](https://zagjs.com/overview/introduction).
  A low level, platform agnostic component library that implements the core logic of the UI components.
  It handles state and events, manages focus etc., but it does not render any UI.
  You will likely not use Zag directly, but you should keep in mind that (pretty much) every Chakra UI component is built on top of Zag.
  You may thus encounter it during debugging sessions.
- [Ark](https://ark-ui.com/).
  A headless component library that supports multiple frameworks (React, Vue, Solid and Svelte).
  Most of the rendering code is implemented in Ark, but it does not provide any styling.
- [Chakra UI](https://chakra-ui.com/).
  The component library is based on React and uses Ark internally.
  This is essentially a repackaging of Ark components with chakra's theming and styling system ("styled system") on top of it.

[This site](https://ark-ui.com/docs/overview/introduction) contains an image that illustrates the architecture of Chakra UI v3.

### Importing the library

In previous versions, Chakra components were imported from `@open-pioneer/chakra-integration`.
This is no longer necessary.
Instead, components must be imported from the `@chakra-ui/react` package directly:

```diff
-import { Button } from "@open-pioneer/chakra-integration";
+import { Button } from "@chakra-ui/react";
```

### Snippets

Chakra V3 has a new snippet system.
Snippets are composite components that are based on Chakra components, but that are not published as part of the Chakra package.

The goal of Chakra is to provide extremely flexible components in its core.
These components are powerful and can be used to build complex UIs, but they are sometimes cumbersome to use for simple use cases.
Snippets resolve this issue by providing a standard component with good defaults (but less flexibility).

When browsing Chakra's documentation, you will sometimes find references to snippet imports such as this:

```jsx
import { Tooltip } from "@/components/ui/tooltip"; // notice the import path
```

When using Trails and you only want to use the _standard_ Chakra snippet, you don't have to download the snippet yourself.
Instead, you can import the snippet from the `@open-pioneer/chakra-snippets` package:

```jsx
import { Tooltip } from "@open-pioneer/chakra-snippets/tooltip";
```

For more details, see the [README](https://github.com/open-pioneer/trails-core-packages/tree/main/src/packages/chakra-snippets#readme) of the `@open-pioneer/chakra-snippets` package.

If you need to use your own custom version of a snippet (e.g. for heavy customization), you can simply download the snippet yourself
and place it somewhere in your project.
The [Chakra CLI](https://chakra-ui.com/docs/get-started/cli#chakra-snippet) can be used for this purpose.

#### Breaking changes

Because Chakra was essentially rewritten from the ground up, many component names (or individual properties) have changed.
For details, see the migration documents linked below.

### Resources

#### Migration documents

The Chakra team has provided the following resources:

- [Chakra UI v3 Announcement](https://chakra-ui.com/blog/00-announcing-v3)
- [Chakra UI v3 Migration Guide](https://chakra-ui.com/docs/get-started/migration)

There is also a repository with LLM instructions made by a community member:

- https://github.com/fdcastel/chakra-v3-llm-template ([Copilot instructions](https://github.com/fdcastel/chakra-v3-llm-template/blob/master/.github/instructions/chakra-v3.instructions.md))

#### Examples

You can take a look at our own migration PRs to see how we adapted our packages to Chakra v3:

- [Core packages](https://github.com/open-pioneer/trails-core-packages/pull/80)
- [OpenLayers base packages](https://github.com/open-pioneer/trails-openlayers-base-packages/pull/422)
- [Starter repo](https://github.com/open-pioneer/trails-starter/pull/124)

### Findings

The following is a collection of findings that we made during the migration.

- React icons + Chakra `<Icon />` do not work together well by default when it comes to the `ref` property.

    This is a bug with react icons (see https://github.com/chakra-ui/chakra-ui/issues/9227 and https://github.com/react-icons/react-icons/issues/336).
    This issue is mostly relevant when using components such as the `Tooltip`, which require that the child (the icon)
    implements the `ref` property correctly.

    To work around this, simply wrap the react icons in a span or div.
    Chakra will style the span and the icon child with fill its parent.

    ```jsx
    <Icon {...props} asChild>
        <span>
            <SomeReactIconsIcon style={{ width: "100%", height: "100%" }} />
        </span>
    </Icon>
    ```

    Another approach is to use the icon directly and not using the `<Icon/>` component at all, for example:

    ```jsx
    <Tooltip content="...">
        <span>
            <FiAlertTriangle color="red" aria-label="..." />
        </span>
    </Tooltip>
    ```

    Note that, in this case, you must either give the icon a label or set `aria-hidden="true"` (this is what Chakra's `<Icon />` component does by default).

- Chakra's `<Icon />` applies `aria-hidden="true"` by default.

    This is good in general, but hurts when you assigned an `aria-label` to the icon manually.
    The `aria-hidden` attribute can be overwritten:

    ```jsx
    <Icon
        color="red"
        className="warning-icon"
        aria-label={status.reason}
        aria-hidden={undefined} // Overwrite icon default so the label gets read (can also use "false")
    >
        <FiAlertTriangle />
    </Icon>
    ```

    Alternatively, you can label the parent element instead.

    NOTE: if you use raw SVGs or images (e.g. directly using the react-icons components) you need to:
    - assign a label / alt text yourself OR
    - set `aria-hidden="true"`

- Theming mechanism has changed:
    - Instead of configuring a _theme_ only, you now configure a _SystemConfig_ object.
    - Use mergeConfigs to merge the base theme with your custom theme (instead of extendTheme).
      Pass theme to `chakraSystemConfig` in `createCustomElement` in `app.ts`.
    - Adjust theme config object to match the new Chakra 3 theme structure of the style SystemConfig object (many changes, see Chakra 3 PR for details).
      To overwrite the default color scheme, you need to specify the color scheme as a token, then set specific semantic tokens and set the colorPalette property in the globalCss object.
    - Removed custom semantics tokens where possible (if chakra has native support). Examples: background_body, background_primary.
    - Added a new prefix to custom semantic tokens (trails\_\*) to avoid conflicts with other tokens / css variables.
    - Tokens that have been used directly in the projects need to be renamed (see Chakra 3 PR for details).
    - `theme` export of `@open-pioneer/base-theme` has been renamed to `config` (of type `SystemConfig`).

- @open-pioneer/chakra-integration has been removed
- @open-pioneer/runtime-react-support has been removed. This was an internal package.
