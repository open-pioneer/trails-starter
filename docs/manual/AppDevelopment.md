# App Development

<!--

TODO:
    - Konzept App <-> WebComponent <-> HTML Site
    - Deployment Konfiguration / Workflow
-->

> NOTE: This document is a work in progress.
> It will be continuously updated during development.

An app is a JavaScript (or TypeScript) package that provides a web component.
The web component can in turn be used within an html file in the same project.
It can also be distributed on its own to be embedded into different host sites.

## Creating an app

To create a new app, first create a new empty directory in `src/apps`, for example `src/apps/my-app`.
Pioneer apps are node packages to benefit from npm's dependency management.
Thus, every app needs a `package.json` file:

```json
// src/apps/my-app/package.json
{
    "name": "my-app",
    "private": true,
    "dependencies": {
        "@open-pioneer/runtime": "workspace:^"
    }
}
```

To create a web component with a simple UI, call the `createCustomElement` function from the `@open-pioneer/runtime` package:

```tsx
// src/apps/my-app/main.tsx
import { createCustomElement } from "@open-pioneer/runtime";

const Element = createCustomElement({
    component: <div>Hello World!</div>
});
customElements.define("my-app-element", Element);
```

The `main.tsx` above defines a custom component called `my-app-element` that can now be used in an `.html` file:

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Demo</title>
    </head>
    <body>
        <my-app-element></my-app-element>
        <script type="module" src="apps/my-app/main.tsx"></script>
    </body>
</html>
```

Finally, launch the development server and inspect the result:

```sh
$ pnpm install
$ pnpm run dev
VITE v4.0.4  ready in 518 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

![my-app rendered in a Browser](./AppDevelopment_HelloWorldBrowser.png)
