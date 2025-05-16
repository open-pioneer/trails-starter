# How to theme an app

This "how to" shows how to create a custom theme for an app. To learn more about the theming
mechanism in Open Pioneer Trails apps, refer to [Theming](../reference/Theming.md).

To show how a custom theme for an app can be created, we will extend the empty app
(at `src/apps/empty`).

By default, the app is shown in a theme specified in the Trails core packages.
To overwrite some or all styles (e.g. the "trails" color scheme), a custom app-theme can be created.

## Create custom theme

First, in your apps "empty" folder, create a new folder called "theme" and add a file called "config.ts".

This file will contain our theme configuration which is part of a Chakra UI style system config object.
The structure of this style system config is described in the [Chakra documentation](https://chakra-ui.com/docs/theming/overview#config).
For creating a theme we will primarily use the [`theme` config property](https://chakra-ui.com/docs/theming/overview#theme).
The custom theme does not need to be a complete theme config: we can just override specific theming properties.

Add the following content to your file:

```ts
// src/apps/empty/theme/theme.ts
// (1)
import { mergeConfigs } from "@chakra-ui/react";
// (2)
import { config as defaultTrailsConfig } from "@open-pioneer/base-theme";
import { sliderAnatomy } from "@chakra-ui/react/anatomy";

// (3)
export const config = mergeConfigs(
    defaultTrailsConfig,
    // (3.1)
    {
        // change default color palette to "primary" color palette
        // see https://www.chakra-ui.com/guides/theming-change-default-color-palette
        globalCss: { html: { colorPalette: "primary" } },
        // specify own theme configuration (see https://chakra-ui.com/docs/theming/overview#theme)
        theme: {
            tokens: {
                colors: {
                    // define color palette for color scheme
                    primary: {
                        50: { value: "#defffd" },
                        100: { value: "#b3fffa" },
                        200: { value: "#86feee" },
                        300: { value: "#61fbdc" },
                        400: { value: "#3efec9" },
                        500: { value: "#32e5a6" },
                        600: { value: "#23b277" },
                        700: { value: "#147f4c" },
                        800: { value: "#004d23" },
                        900: { value: "#001b0a" },
                        950: { value: "#000b06" }
                    }
                }
            },
            semanticTokens: {
                colors: {
                    // define semantic tokens to allow usage of `colorPalette` property in components
                    // see https://chakra-ui.com/docs/theming/customization/colors#color-palette
                    primary: {
                        solid: { value: "{colors.primary.500}" },
                        contrast: { value: "{colors.white}" },
                        fg: { value: "{colors.primary.700}" },
                        muted: { value: "{colors.primary.100}" },
                        subtle: { value: "{colors.primary.50}" },
                        emphasized: { value: "{colors.primary.300}" },
                        focusRing: { value: "{colors.primary.500}" }
                    },

                    // define custom semantic tokens
                    primary_background_primary: { value: "{colors.primary.300}" },
                    primary_background_light: { value: "{colors.primary.50}" },
                    primary_font_primary: { value: "{colors.black}" },
                    primary_font_secondary: { value: "{colors.gray.500}" },
                    primary_font_inverse: { value: "{colors.white}" },
                    primary_border: { value: "{colors.black}" },

                    // override chakra internal semantic tokens
                    // see https://github.com/chakra-ui/chakra-ui/blob/main/packages/react/src/theme/semantic-tokens/colors.ts
                    fg: {
                        DEFAULT: {
                            value: "{colors.primary_font_primary}"
                        },
                        subtle: {
                            value: "{colors.primary_font_secondary}"
                        },
                        inverted: {
                            value: "{colors.primary_font_inverse}"
                        }
                    },
                    bg: {
                        DEFAULT: {
                            value: "{colors.primary_background_primary}"
                        },
                        muted: {
                            value: "{colors.primary_background_light}"
                        }
                    },
                    border: {
                        DEFAULT: {
                            value: "{colors.primary_border}"
                        }
                    }
                }
            },
            // Change style of components
            // see https://chakra-ui.com/docs/theming/customization/recipes#recipes
            recipes: {
                link: {
                    variants: {
                        variant: {
                            plain: {
                                color: "primary_font_link"
                            }
                        }
                    }
                }
            },
            // Change style of multipart components
            // see https://chakra-ui.com/docs/theming/customization/recipes#slot-recipes
            slotRecipes: {
                slider: {
                    slots: sliderAnatomy.keys(),
                    variants: {
                        size: {
                            sm: {
                                root: {
                                    "--slider-thumb-size": "sizes.3.5",
                                    "--slider-track-size": "sizes.0.5"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
);
```

- **(1)** Import the `mergeConfigs` helper function.
- **(2)** Import the Trails base theme config from the "@open-pioneer/base-theme" package.
- **(3)** Use `mergeConfigs` to create an own style system configuration. Use the `defaultTrailsConfig` as first parameter so that the custom theme configuration is based on the Trails' base theme configuration.
- **(3.1)** Chakra UI style system configuration object that holds the custom configuration.

The Trails base theme introduces an additional special semantic token that might be overridden in the custom theme.
This semantic token is `trails_placeholder` and specifies the color used for the placeholder text in input fields or text areas.
For additional information about which values are available, see the base-theme core package code.

The dependency of the `@open-pioneer/base-theme` package needs to be added in the `package.json` of the app:

```json
// src/apps/empty/package.json
{
    ...
    "dependencies": {
        ...
        "@open-pioneer/base-theme": "catalog:"
    }
}
```

## Use the created theme in an app

To make use of the custom theme in the app, we need to modify the `app.ts`:

```ts
// src/apps/empty/app.ts
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI";
// (1)
import { config } from "./theme/config";

const Element = createCustomElement({
    component: AppUI,
    // (2)
    chakraSystemConfig: config,
    appMetadata
});

customElements.define("empty-app", Element);
```

- **(1)** Imports the custom theme config.
- **(2)** Specifies `chakraSystemConfig` as the application's theme configuration.
