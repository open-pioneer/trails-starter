# @open-pioneer/chakra-integration

This package integrates [Chakra UI](https://chakra-ui.com/) into the open pioneer project.
All components are re-exported from `@chakra-ui/react` (sometimes with some modifications).
All UI packages using the pioneer framework should use this package instead of depending on `@chakra-ui/react` directly.

## Internals

Some changes are made to complex components such as `Modal`, `Drawer` etc. to support integration
into a web component's shadow dom.
See comments in `./Provider.tsx` for more details.
