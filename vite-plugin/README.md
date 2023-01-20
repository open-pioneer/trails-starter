# Pioneer vite plugin

Implements certain build-time features required by pioneer apps.

Usage:

```js
// In your vite configuration file
import { pioneer } from "./vite-plugin";

export default defineConfig({
    // ...
    plugins: [
        pioneer({
            // See configuration reference below
            rootSite: true
        })
        // ...
    ]
});
```

## Configuration reference

All configuration properties are optional.
At least one of `rootSite`, `sites` or `apps` should be non-empty for a successful build.

```ts
export interface PioneerPluginOptions {
    /**
     * Whether to include the root `index.html` site (by default at `src/index.html`) in the build.
     *
     * The file is always available when using the development server, but may be excluded when
     * when deploying the project as it often contains content for testing.
     *
     * @default false
     */
    rootSite?: boolean;

    /**
     * List of sites to include in the build.
     *
     * Sites are located at `src/sites/<SITE_NAME>/index.html` by convention.
     *
     * @default []
     */
    sites?: string[];

    /**
     * List of apps to include in the build.
     * Apps typically register a custom web component.
     *
     * Apps are located at `src/apps/<APP_NAME>/app.<EXT>` by default.
     * When an app is included in the build, the `dist` directory will
     * contain a `<APP_NAME>.js` that can be directly imported from the browser.
     *
     * Multiple extensions are supported for the app's main entry point: .ts, .tsx, .js and .jsx.
     *
     * @default []
     */
    apps?: string[];
}
```

## Features

### Multi page support

Vite is by default configured to create a single page application (i.e. a single html file with assets).
The pioneer repository supports multiple deployment modes that can each be achieved by configuring this plugin:

1. Building a single page application.
   Configure `rootSite: true` and leave `sites` and `apps` empty.

2. Building one or more web components.
   Configure the `apps` parameter:

    ```js
    pioneer({
        // Creates a my-app.js file in dist/ that can be imported from the browser.
        apps: ["my-app"]
    });
    ```

3. Building a multi page application.
   This is convenient for testing and also sometimes for production, since it allows for demonstrating apps in multiple configuration.

    For example, a project might have a set of sample sites for local development and testing:

    ```js
    pioneer({
        // Only enable sites during testing.
        // `testing` can be, for example, initialized from the environment or from a local configuration file.
        //
        // See https://vitejs.dev/config/#configuring-vite for more details
        sites: testing && ["sample-1", "sample-2"],

        // Always deploy my-app.js as a web component.
        apps: ["my-app"]
    });
    ```

This plugin internally configures the rollup options inside vite's config to achieve above goals.
`build.rollupOptions.input` and `.output` should not be altered manually when using this plugin.
