import { Plugin } from "vite";
import { codegenPlugin } from "./codegenPlugin";
import { mpaPlugin } from "./mpaPlugin";

/** Options for the open-pioneer vite plugin. */
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
     * Sites are located at `src/sites/<SITE_NAME>/index.html` by default.
     *
     * @default []
     */
    sites?: string[] | undefined | false;

    /**
     * List of apps to include in the build.
     * Apps typically register a custom web component.
     *
     * Apps are located at `src/apps/<APP_NAME>/app.<EXT>` by default.
     * When an app is included in the build, the `dist` directory will
     * contain a `app.js` that can be directly imported from the browser.
     *
     * Multiple extensions are supported for the app's main entry point: .ts, .tsx, .js and .jsx.
     *
     * @default []
     */
    apps?: string[] | undefined | false;
}

export function pioneer(options?: PioneerPluginOptions): Plugin[] {
    return [mpaPlugin(options), codegenPlugin()];
}
