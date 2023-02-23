# Design

The purpose of this project is building web applications from a set of composable building blocks.

## Requirements

-   Web applications must be embeddable into host websites without causing much friction (such as JS/CSS conflicts).
    The final artifact(s) shall be static files (.js, .html, etc.) that can be deployed easily on common http servers.

-   Web applications shall be able to expose an API to their host site (e.g. methods, events)

-   It should also be possible to easily implement and deploy "classic" single page application, both
    for testing/demonstration and for projects where the application does not need to be embedded anywhere else

-   Applications should be composed of smaller packages that may be developed separately.
    Those building blocks ("bundles") should support

    -   Development across multiple repositories with separate compilation
    -   Reusing common building blocks between applications and teams
    -   Mixed licensing (e.g. open source foundation with proprietary features implemented "on top")
    -   Easy dependency/package management (integrates with NPM, supports CVE audits and license compliance scans)

-   For the developers of web applications, the system should offer

    -   Support for modern technologies such as TypeScript, SCSS and UI-Libraries such as React and/or Vue
    -   Dependency injection for class instances that depend on services provided by other classes
    -   Enforcement of/support for clear interfaces between application components
    -   Support for extension / configuration of existing application components
    -   Automatic handling of i18n / translations
    -   Automatic loading of styles
    -   Automatic inclusion of misc. assets (such as images)
    -   A productive development experience (including hot module reloading and good debugger support)

-   The user interface framework(s) must support accessibility

-   The system should use well known open source standard technology wherever possible to reduce friction, onboarding time

-   A development starter/template project should enforce a common project structure with examples and preexisting scripts
    for common tasks, such as building, publishing, testing, etc.

-   All routine tasks shall be automated.

## Technology choices

### Vite

[Vite](https://vitejs.dev/) has been chosen as the basis for this project.
Vite is a compiler for JavaScript based web applications that implements optimized building of apps, a good developer experience with a rich plugin ecosystem.
Vite builds on top of [Rollup](https://rollupjs.org) and inherits its extensible plugin API, which we already have deep experience with.

Many of the requirements above can be implemented by using and configuring Vite (e.g. building a static site, productive developer experience)
and by installing existing plugins (e.g. SCSS, React support).

Missing functionality can be implemented on top of Vite using its plugin API:

-   Support for simple multi page applications (many .html files)
-   Deployment as a web component
-   Automatic discovery and linking of application building blocks ("bundles")

Further links:

-   Vite plugins: https://github.com/vitejs/awesome-vite
-   Rollup plugins (usually compatible with vite): https://github.com/rollup/awesome
-   Vite features: https://vitejs.dev/guide/features.html
-   Vite plugin API (extension of Rollup's plugin API): https://vitejs.dev/guide/api-plugin.html
-   Rollup plugin API: https://rollupjs.org/guide/en/#plugin-development

### Web Components

An app built by this project will primarily be deployed as a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

Web Components by themselves enable easy integration into a host site (the developer creates a custom HTML tag).
Together with the [Shadow DOM API](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), web components can be
encapsulated from the host site, avoiding CSS conflicts for example.

Some effort must be invested to use CSS correctly: Vite injects styles into the document head by default, where they would not apply
to web components using the shadow dom.
Styles will have to be injected within the shadow dom instead.

### PNPM / Monorepo

A monorepo approach appears to be a good solution to facilitate separate development of application building blocks: a repository
will consist of one or more bundles, packages and apps that may depend on each other.
Well defined interfaces can be enforced on the package level.

With its support for workspaces, advanced dependency management and generally good performance, [PNPM](https://pnpm.io/) has been chosen as the package manager.
PNPM can automatically link packages within the same workspace when they depend on each other (still enforcing 'clean' dependency declarations).
Vite supports pnpm workspace layouts by following the links and detecting that they point into the project itself, automatically applying rules and plugins like "usual".

During the initial development phase, all code will exist within a single repository.
In the future, it will be possible to develop and compile application building blocks separately - possibly using different licenses - and share them via npmjs.com or a compatible registry.

### TypeScript

TypeScript supports the creation of clean (and clear) interfaces through type checking.
Usage of TypeScript is _recommended_ for all implementation files (and often _required_).
Plain JavaScript is also supported.

### React

Both React and Vue have been considered as the UI layer for this project.
React has been chosen instead of Vue for a few reasons:

1. React's open source community is significantly larger and maintains a richer ecosystem.
   This should make it easier to find appropriate open source solutions (e.g. for a11y, i18n).
2. React's long term stability has historically been very good.
   See also react's stability commitment: https://reactjs.org/docs/faq-versioning.html#commitment-to-stability
3. It integrates slightly better with TypeScript:
   TypeScript natively supports React's syntax, whereas Vue requires special IDE-addons and compiler plugins to implement its custom languages.

Ultimately, we expect the integration with the UI layer to be relatively simple, so changing the UI framework during development is possible and should not be a large concern.

### Component Framework

[Chakra UI](https://chakra-ui.com/) was chosen as the main React component framework after a in-depth evaluation of alternatives (including MUI, Fluent UI and Mantine).
Reasons for that choice include:

-   Very good support for a11y
-   Good support for customization / themes
-   Large set of builtin components (although no rich table by default)
-   Well maintained
-   Can integrate (with some complexity) into the shadow dom technology

[Material UI](https://mui.com/core/) was the second contender.

### I18N Framework

[FormatJS](https://formatjs.io/) was chosen as the i18n framework for our technology stack.
It it well maintained, used by a large number of projects and has a well designed API.
The central interface exposed by FormatJS is the `intl` object (see [API](https://formatjs.io/docs/react-intl/api/#intlshape)).

## Implementation strategy

Some of the requirements above can already be resolved by the choices in technology.
For example, Vite is already able to build a static web application, already supports modern frontend technologies and provides a good developer experience.
PNPM's workspaces make it easy to develop an application as a collection of interconnected packages.

Some additions must be developed on top of these technologies to support the remaining requirements:

-   The service layer, including dependency injection and configuration
-   Automatic discovery and loading of application building blocks (including services, i18n files, styles, etc.)
-   Integration as a web component
-   Deployment as a multi page application

The following sections describe the process by which apps are built and started.

### Overview

Tooling will be provided to simplify working with many building blocks and dependency injection.
During development and during build time, building blocks referenced by an app will be automatically detected and integrated into the application.
The process works as follows:

1. Detect building blocks used by the application.
   This is done by parsing the appropriate `package.json` file, detecting its `dependencies` and checking which of those dependencies
   are actual building blocks (and not just plain node packages).
   Plain node packages and building blocks can be differentiated by detecting the presence (and the contents) of a special configuration file (see "Building block configuration" further below).
   These building blocks are added to a set and are then recursively scanned until no more new dependencies can be found or until all remaining dependencies are plain node modules.

2. Generate code and data structures based on metadata within the building blocks.
   Every building block contains a configuration file that informs the system about its contents.
   This includes:

    - Services implemented by the building block
    - Services required by the building block
    - Supported languages and translation files
    - CSS files
    - Misc. assets, i.e. static files

    These configurations will be combined by the build step into a data structure that represents the contents of all building blocks detected in step 1.

3. Automatically setup all building blocks when the application starts.
   The runtime environment will receive the data structure generated in step 2.
   It will then automatically launch all required services and inject appropriate dependencies, inject i18n data, load styling etc. based on that data structure.

4. After that, the UI is rendered into the web component root node.

Steps 1 and 2 must be implemented in the build system as a vite plugin.
Steps 3 and 4 will be implemented as a JavaScript API that runs in the browser.

### Build system

Steps 1 and 2 require analysis of the source code and subsequent code generation.
This functionality is best implemented as a vite plugin.

The following example shows an `app.ts` file that demonstrates the integration of build system and runtime code.
The only 'magic' behavior is provided as an import of a virtual module `pioneer:app`.

```js
// Virtual module supported in app.{js,ts} files, implemented via plugin.
// The imports contain the generated data structures (and references to code) mentioned in step 2.
// The vite plugin is responsible for generating data structures in the appropriate format understood by the runtime.
import { bundles, styles } from "pioneer:app";

// Web component factory function imported from the runtime package.
import { createCustomElement } from "@open-pioneer/runtime";

// Configuration object accepted by the runtime environment; `bundles` and `styles` are simply passed through.
// This would also be the appropriate place to implement additional features (such as custom configuration options, or
// the web component's public API).
const app = {
    name: "sample-app",
    bundles: bundles,
    styles: styles
};

// Creates and registers the web component <sample-app /> from the `app` object.
globalThis.customElements.define("sample-app", createCustomElement(app));
```

#### Details

The vite plugin implements at least one virtual module (called `pioneer:app` in the sample code above).
To achieve that, the `resolveId` and `load` (and/or `transform`) rollup hooks must be provided (see https://rollupjs.org/guide/en/#build-hooks).

The `resolveId` hook handles the virtual module id and takes note of its importer.
The module id will be resolved to an absolute virtual module id (e.g. `"\0pioneer:app?imported-from=..."`) which must in turn be implemented by the `load` hook.

During `load`, the resolved module id is parsed and the app's `package.json` is located.
For every `node_modules/*` dependency, check the _real_ path of the package on disk and if it is located inside the source folder, analyze it like described in step 1 above.
To enable reloads during development, all `package.json` files (and other config files) read along the way must be tracked via rollup's `this.addWatchFile(...)`.
Finally, the `load` hook generates a JavaScript module containing the building block's metadata found in the analysis (i.e. the exports `bundles` and `styles` in the code sample above).

> Out-of-source building blocks (i.e. building blocks installed via npm) are currently not supported.
> Support will be added in a future revision.

#### Building block configuration

Every building block should contain a configuration file (e.g. `build.config.js`) that contains the necessary metadata required by the system.

Example (pseudocode):

```js
// build.config.js
import { defineBuildConfig } from "@open-pioneer/build-support";

// The function does nothing at runtime but provides auto completion to the user.
export default defineBuildConfig({
    type: "bundle",

    // References the main [s]css file (which can contain other css imports)
    styles: "styles.css",
    ui: {
        // TODO
    },
    services: {
        // Name of the service must match an export from the bundle's main entry point (i.e. `index.{js,ts}`)
        MyComponent: {
            requires: {
                _foo: "someOtherBundle.someService"
            },
            provides: "myBundle.myService"
        }
    }
});

// index.js
export class MyComponent {
    // TODO
}
```

### Runtime environment

The runtime environment receives the configuration object (via the `app` parameter), including the generated data structures from the previous step and creates a web component class.

The responsibilities are:

1. Return a web component class from `createCustomElement` that launches the configured app when loaded into the DOM.
2. Load all required styles into the web component's shadow DOM
3. Load translation files and pick the correct language
4. Launch all requires services and inject required references (required components launch before their dependents, cycles are an error)
5. Set up the UI Framework (Framework specific options, e.g. root nodes for menus).
6. Render the application's UI
7. Expose an API from the web component

### Test support

In addition to the "normal" runtime implementation, a small test utility must be created to support tests for service classes and UI Components.
The utility should perform dependency injection in the same way as the runtime, but with very simple configuration:

```js
// DRAFT API
import { createService } from "@open-pioneer/runtime-test-utils";

// Requires `some.Service` as `foo`.
import { MyService } from "./MyService";

it("should run", function () {
    const service = createService(MyService, {
        // Mock of the `some.Service` interface will be made available to the new `MyService` instance
        foo: {
            doTheThing() {
                console.log("Called from service");
            }
        }
    });

    // Calls `foo.doTheThing()`
    service.run();
});
```

React components that integrate into the service layer (via hooks `useSerivce`, `useProperties` etc.) also need some testing support to provide test dependencies.
A custom provider can be used to supply service instances (and properties etc.) into the component tree.
This is implemented in the `@open-pioneer/test-utils` package:

```jsx
it("should be able to use a test service", function () {
    // A simple component that uses a service.
    function Component() {
        const service = useService("testService");
        return <div>Message: {service.getMessage()}</div>;
    }

    // Setup test services.
    const mocks = {
        services: {
            testService: {
                getMessage() {
                    return "Hello World!";
                }
            }
        }
    };

    // The PackageContextProvider parent ensures that the useService() in our test component works.
    render(
        <PackageContextProvider {...mocks}>
            <Component />
        </PackageContextProvider>
    );
});
```

### App Configuration

There are multiple kinds of configuration properties that should all be supported:

1.  Default configuration options in a service that can be customized
2.  Static application-wide configuration in an app, either in code or in a configuration file.
    These properties should be shared by all instances of the same app.
3.  Dynamic application-wide configuration, for example by fetching a resource from a server.
    These properties should be shared by all instances of the same app.
4.  Dynamic per-application configuration, for example HTML attributes on the custom element.

Default configuration properties can be declared with other service metadata in the `build.config.js` file of a bundle.
These values will serve as fallback values in case no other value is provided.

To implement the remaining cases, the most general solution would be to provide a callback in the `app` object responsible for
loading configuration properties:

```js
const app = {
    // Called on app start
    async loadProperties(context) {
        // Context also contains html attributes etc.
        const dynamicProperties = await fetch("https://example.com/property-source");

        // App is initialized with these properties
        return {
            "some.property": dynamicProperties.property
        };
    }
};

// Creates and registers the web component <sample-app /> from the `app` object.
globalThis.customElements.define("sample-app", createCustomElement(app));
```

More specific ways of configuration can be built on top of this generic API.
For example, a hardcoded value can be returned, or a `.json` file can be imported and returned.

### I18N Support

FormatJS will be integrated as the runtime component for i18n support.
Every package can define a set of translation files (one per supported language) which will be loaded at runtime by the framework.

> NOTE: The build system combines translation files of individual packages into per-app translation files for efficiency.
> Thus, there is one translation file per (app, supported language) combination.

Every package currently receives its own `intl` instances with the appropriate messages defined in the translation files.

### Multi-page application

A single repository should be able to produce multiple web components and html files.
The vite plugin will be extended to allow for simple configuration of multiple entry points for production builds (`rollupOptions`).
