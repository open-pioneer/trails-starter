# @open-pioneer/build-support

Provides the `defineBuildConfig` function and associated TypeScript interfaces.
This enables auto completion in `build.config.mjs` files.

## Example

```js
// build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "./styles.css",
    ui: {
        references: ["some.example.Interface"]
    }
});
```
