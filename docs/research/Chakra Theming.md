# Hints Chakra Theming

(applies to Chakra UI version `2.8.0`)

-   Chakra use a few (internal) semantic tokes that can be overridden to quickly change the default colors
-   these values are not applied to components that define a color scheme by default (e.g. Button uses color scheme _gray_ by default)

```json
{
    "chakra-body-bg": "blue.500",
    "chakra-subtle-bg": "blue.300",
    "chakra-body-text": "black",
    "chakra-subtle-text": "gray.500",
    "chakra-inverse-text": "white",
    "chakra-border-color": "black",
    "chakra-placeholder-color": "gray.500"
}
```

-   it is preferable to use color schemes instead of values for background color, color...
    -   hover color and existing variants work automatically
-   color scheme can only be set in the defaultProps, not for each variant
    -   variants have to define background color, color...
-   Chakra's predefined semantic tokens (see above) are not applied if variants are used
    -   a variant has to specify every applicable property
-   baseStyle is only applied to variants (it is not applied if the component has no `variant` attribute)
    -   a default variant can be specified in the defaultProps
-   only `colorScheme`, `variant`, `size` can be specified in defaultProps
    -   everything else has to be defined in the baseStyle or a variant

```js
{
    Button: {
        defaultProps: {
            colorScheme: "blue"
            //variant: "myDefaultVariant"
            //size: "md"
        },
        baseStyle: {
            // ...
        },
        variants: {
            cancel: {
                color: "chakra-body-text",
                //chakra-body-text is not used automatically for variants but for components without variant attribute
                bg: "red.500",
                _hover: {
                    backgroundColor: "red.600"
                }
            }
        }
    }
}
```
