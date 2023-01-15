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

    -   Support for modern technologies such as TypeScript, SCSS and UI-Libraries such as React and Vue
    -   Dependency injection for class instances that depend on services provided by other classes
    -   Enforcement of/support for clear interfaces between application components
    -   Support for extension / configuration of existing application components
    -   Automatic handling of i18n / translations
    -   Automatic loading of styles
    -   Automatic inclusion of misc. assets (such as images)
    -   A productive development experience (including hot module reloading and good debugger support)

-   The system should use well known open source standard technology wherever possible to reduce friction, onboarding time

-   A development starter/template project should enforce a common project structure with examples and preexisting scripts
    for common tasks, such as building, publishing, testing, etc.

-   All routine tasks shall be automated.

### Optional goals

TDB

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

An app build by this project will primarily be deployed as a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

Web Components by themselves enable easy integration into a host site (the developer creates a custom HTML tag).
Together with the [Shadow DOM API](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), web components can be
encapsulated from the host site, avoiding CSS conflicts for example.

Some effort must be invested to use CSS correctly: Vite injects styles into the document head by default, where they would not apply
to web components using the shadow dom.
Styles will have to be injected within the shadow dom instead.

### PNPM / Monorepo

A monorepo approach appears to be a good solution to facilitate separate development of application building blocks: a repository
will be consist of one or more bundles, packages and apps that may depend on each other.
Well defined interfaces can be enforced on the package level.

With its support for workspaces, advanced dependency management and generally good performance, [PNPM](https://pnpm.io/) has been chosen as the package manager.
PNPM can automatically links packages within the same workspace when they depend on each other (still enforcing 'clean' dependency declarations).
Vite supports pnpm workspace layouts by following the links and detecting that they point into the project itself, automatically applying rules and plugins like "usual".

During the initial development phase, all code will exist within a single repository.
In the future, it will be possible to develop and compile application building blocks separately - possibly using different licenses - and share them via npmjs.com or a compatible registry.

## Implementation

TDB

##
