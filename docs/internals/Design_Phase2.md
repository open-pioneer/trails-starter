# Design

## Introduction

This document contains the design for the second implementation phase of the pioneer framework.
The goal of this phase is to enable development across multiple repositories, i.e. using non-local packages
in an open pioneer app and sharing such packages with other developers.

Note that most aspects in this document are concerned with _packages_, not with _apps_.
Building and distributing an application is a problem solved with phase 1, and only a few modifications
must be made to enable "foreign" packages.
However, some infrastructure and conventions are needed to enable easy sharing of packages.

## Separate compilation

So far, packages have only been compiled in the context of an app, together with all other packages.
In order to be "publishable", packages must be prepared as individual artifacts.

For better stability, compatibility and performance it is desirable to restrict files types within published
packages to a certain subset of "simple" types:

-   `.js` for code (optionally including `.map` and `.d.ts` files)
-   `.css` for styles (optionally including `.map`)
-   `.json` for i18n (TODO: reuse yaml?)

This means that a package's source code must be pre-compiled with appropriate compilers (transpile typescript, jsx etc, sass etc.).

Bundling or aggressive optimization is not required at this stage (packages will be built as part of an app, vite will optimize at that stage).
It may in fact be a disadvantage because it makes generated code harder to read (and patch!).

## Requirements

-   A build tool that compiles a single package, handling TypeScript/JavaScript/JSX, CSS and assets such as README or LICENSE files.
-   A tool to publish such a compiled package to a registry
-   Existing build tools must be able to handle external packages with pioneer extensions
-   Configuration / Documentation: How to build and host api docs
-   Documentation: How to use an external package

## Assumptions

-   All packages will ultimately be built using vite, with our pioneer vite plugin enabled.
    Applications will always contain our matching runtime package.
    This gives us some leeway w.r.t. special vite imports (e.g. `?inline`) - we can just pass them through and not replace them at all.

## Package format

-   The `build.config.mjs` format will be extended with the `entryPoints` option.
    Listed entry points are TypeScript/JavaScript files that will be made available to importers.
    _All other files are not guaranteed to be present and can not be directly imported at all._

    Example:

    ```js
    // build.config.mjs
    export default defineBuildConfig({
        entryPoints: ["./index.ts"]
    });
    ```

    The `entryPoints` option is mandatory for packages that are going to be published.

    > NOTE: This choice was made to allow for future optimizations (e.g. bundling) and to enforce clean
    > developing conventions.

    The `entryPoints` will be used to generate the `exports` part of the generated `package.json` file (See [Reference](https://nodejs.org/api/packages.html#package-entry-points)).

    > NOTE: the services entry point will be implicit, i.e. it does not have to be listed to be included.

    For example:

    ```jsonc
    // package.json
    {
        "name": "my-package",
        "exports": {
            ".": {
                "import": "./index.js",
                "types": "./index.d.ts"
            }
        }
    }
    ```

-   Other extensions to the `build.config.mjs`:

    -   Which assets to copy
    -   Which readme content to include
    -   Which license to include
    -   `package.json` overwrites (most values will be taken from the source `package.json`)
    -   ...

-   The build tool will place additional metadata into the generated `package.json`.
    Metadata is taken mostly from the source package's `build.config.mjs` (which will not be present in the compiled package):

    ```jsonc
    {
        "name": "my-package",
        // ...
        "openPioneer": {
            "metadataVersion": "1.0",
            "services": {
                "ServiceA": {
                    // ...
                }
            },
            "properties": {
                // ...
            }
        }
    }
    ```

    It is easier and more performant to put metadata in the `package.json`.
    It does not have to be edited by hand and we have to open the `package.json` anyway during package discovery.
    This makes the answer to the question "does this package use open pioneer features" very quick to answer.

## Build plugin

The existing vite plugin must be extended to handle pioneer packages from `node_modules`.
Vite handles node packages from `node_modules` just fine on its own, but our own build plugin ignores them currently.

They must not be be ignored in the future because the services, properties and styles from such a package must be linked into the application,
which is the responsibility of our plugin.

Vite build plugin will scan all dependencies (local and non-local) of an app to check whether they are either local or use pioneer extensions (check for presence of `openPioneer` in `package.json`).
For local packages, the process stays as it is.
For non-local packages (in `node_modules`) the recursive search continues until a "non-pioneer" package is found, which will then be ignored just as before.
All services, properties etc. of discovered packages will then be linked into the application.

Note that this search will not discover pioneer packages that are dependencies of "plain" packages, i.e.

    "app" -> "package without openPioneer" -> "package with openPioneer"

will not be detected.

This is a worthwhile tradeoff because

1. all of our own packages should be build with `"openPioneer"` included (so the situation shouldn't occur in practice) and
2. it still lets us skip many node modules (e.g. dependencies of chakra-ui), thereby improving performance

## Package build tool

A new build tool will compile a package from its source representation into a package ready for distribution.

The phases to be implemented are as follows:

-   Transpile TypeScript/JavaScript (and JSX/TSX) to .js (with .map, .d.ts when enabled).

    Notes:

    -   Use rollup (with preserveModules) to strip test files etc. Use `entryPoints` as input.
        Bundling is not necessary.
    -   Mark everything as external that is not a local file
    -   Use rollup-plugin-dts for .d.ts files
    -   Transpile JSX with swc or esbuild (as rollup plugins)
    -   Handle vite-style imports (i.e. `foo.js?worker` -> resolve to `foo.js` so it gets included in the build)

-   Transpile scss to css, bundle css

    -   sass / postcss
    -   see vite source
    -   do not include node_modules during bundle (css would be copied multiple times if multiple packages use it)

-   Optional: Transpile i18n yaml to json

-   Copy assets:

    -   README
    -   LICENSE
    -   assets/\*

-   Assemble a `package.json` with metadata

## Proof of Concept

-   Extract framework/\* packages into their own repository
-   Put open-layers and base components into their own repository
-   The existing starter repository should then be almost empty (with dependencies and sample apps ofc.).
    Everything should work like it used to.
