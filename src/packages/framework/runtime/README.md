# @open-pioneer/runtime

Implements the runtime environment for open pioneer apps.

## Quick start

Import the `createCustomElement` function from this package to create your application as a Web Component:

```js
// my-app/app.js
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI";

const Element = createCustomElement({
    component: AppUI,
    appMetadata
});

customElements.define("my-app", Element);
```

In this example, `Element` is a custom web component class registered as `<my-app>`.
The application renders the `AppUI` (a react component) and automatically contains services, styles etc. its package dependencies.
HTML sites or JavaScript code can now instantiate the application by creating a DOM-Element:

```html
<!-- some-site/index.html -->
<!DOCTYPE html>
<html>
    <body>
        <!-- Contains the app once the script has been loaded -->
        <my-app></my-app>
        <script type="module" src="/apps/my-app/app.ts"></script>
    </body>
</html>
```
