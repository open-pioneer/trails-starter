# Guide to the repository

## Overview

The following figure gives a brief overview of the repository structure.

<!-- tree -L 2 --gitignore --dirsfirst -->

```
starter
├── docs                    -- Documentation
├── src                     -- Contains project code
│   ├── apps                -- Apps go here
│   ├── packages            -- Packages that can be used by apps
│   ├── samples             -- Example sites, apps and packages
│   ├── types               -- TypeScript support files
│   ├── sites               -- Additional .html sites
│   └── index.html          -- Main HTML entry point
├── .editorconfig           -- Common text file settings (encoding, line length)
├── .eslintignore           -- Lists files ignored by ESLint
├── .eslintrc               -- ESLint configuration file
├── .gitignore              -- Lists files ignored by git
├── .npmrc                  -- pnpm configuration file
├── .prettierrc             -- Prettier configuration file
├── package.json            -- Dependencies of the root package (mostly development tools)
├── pnpm-lock.yaml          -- Package manager lockfile
├── pnpm-workspace.yaml     -- Workspaces configuration file for pnpm, also includes the dependency catalog
├── tsconfig.json           -- Main TypeScript configuration file for code that runs in the browser
├── tsconfig.node.json      -- Additional TypeScript configuration file for files running in Node
├── typedoc.base.json       -- TypeDoc configuration that is used as a base for the TypeDoc configuration in the packages
├── typedoc.config.cjs      -- TypeDoc main configuration file
└── vite.config.ts          -- Vite configuration file
```

## Node scripts

Some frequently used tasks are implemented as scripts in the root `package.json` file.
They should be invoked via pnpm: `pnpm run <SCRIPT_NAME>` (`run` is optional if the script name is unambiguous).

### `pnpm run dev`

Launches [Vite's](https://vitejs.dev/) local development server.
The main configuration file for vite is `vite.config.ts`.

### `pnpm run check-types`

Runs the [TypeScript compiler](https://www.typescriptlang.org/) to detect problems during development.

### `pnpm run watch-types`

Starts the [TypeScript compiler](https://www.typescriptlang.org/) in watch mode to detect problems during development.
It is recommended to run this script alongside the `dev` server.

### `pnpm run test`

Starts [Vitest](https://vitest.dev/) to run all automated tests.
Vitest will automatically watch all source code files and will rerun tests during development whenever it detects changes.

### `pnpm run build`

Builds the project as a static site.
Generated files are output into the `dist/www` directory.
The main configuration file for vite is `vite.config.ts`.

### `pnpm run build-docs`

Builds the project's API documentation.
Documentation is generated using [TypeDoc](https://typedoc.org/).

TypeDoc is configured in the `typedoc.config.cjs` (this file contains the "global" TypeDoc configuration).
Most importantly, it configures for which packages API documentation will be built.
The default configuration file contained in this repository will build the documentation for all packages within `src/packages/**`.
However, you can freely edit the `typedoc.config.cjs` to your liking.

In the individual packages, a `typedoc.json` file specifies how the input is converted.
The `typedoc.base.json` file is used as a base for the typedoc configuration specified in the single packages.
The API documentation is written into `dist/docs`.

You can serve the API documentation locally by executing:

```sh
$ pnpm install -g serve     # installs the 'serve' web server globally (needed only once)
$ pnpm build-docs
$ pnpm serve dist/docs
```

### `pnpm run build-license-report`

Create a license report for dependencies used by the project.
The report is written to `dist/license-report.html`.
The source code for report generation is located in `support/create-license-report.ts`.
Configuration happens via `support/license-config.yaml`.

### `pnpm run generate-sbom`

Generate a [CycloneDX](https://github.com/CycloneDX) SBOM (Software Bill of Materials) for the project.
The generated sbom file is written to `dist/sbom.json`.
The source code for report generation is located in `support/create-cyclonedx-sbom.ts`.
Currently only JSON encoding is supported. The generated SBOM lists all components excluding devDependencies.

The script reads the project name (and, if present, the version) from the project root's `package.json` and embeds it into the SBOM.
The current git revision (commit hash of `HEAD`) is also included.

> [!IMPORTANT]
> This command depends on [Trivy](https://github.com/aquasecurity/trivy) and can only be executed if Trivy is [installed](https://aquasecurity.github.io/trivy/latest/getting-started/installation/) globally.

### `pnpm run preview`

Starts a local http server serving the contents of the `dist/www` directory.

### `pnpm run clean`

Removes files that were created during the build (e.g. the `dist` directory).

### `pnpm run lint`

Runs [ESLint](https://eslint.org/) on all source code files to detect problems.
Simple errors can be fixed automatically by running `pnpm run lint --fix`.
ESLint is configured via the `.eslintrc` file.

### `pnpm run prettier`

Runs [Prettier](https://prettier.io/) on all source code files for automated (re-) formatting.
Prettier and ESLint are integrated (see `.eslintrc`), so prettier rules are also respected when linting.

### `pnpm audit`

Checks for known security issues with the installed packages. (Will also be checked with a nightly github action job)

### Miscellaneous tools

Installed node tools can be invoked by running `pnpm exec <TOOL_AND_OPTIONS>` (once again, the `exec` is optional).

## Common workflows

### Adding a dependency

To install a shared build dependency (a vite plugin for example), run `pnpm add -D -w <PACKAGE_NAME>`.
`-D` will include the package as a devDependency, and `-w` will add it to the workspace root's `package.json`.

To add a dependency to a workspace package or app, execute `pnpm add PACKAGE_NAME` from the package or app directory.

You can also add the dependency manually by editing the `package.json` file directory.
Keep in mind to execute `pnpm install` to update the lockfile after you're done with editing.

### Updating a dependency

You can always update your dependencies by simply editing the `package.json` files directly, or by using pnpm's catalog feature.
Keep in mind to also execute `pnpm install` in that case, to make sure that your lockfile reflects the changes you made.

pnpm has a helpful [`update`](https://pnpm.io/cli/update) command to update packages automatically or interactively.
For example:

```bash
# Updates all dependencies in all packages interactively with a simple CLI wizard.
# By default, updates will respect the sematic versioning restrictions in your package.json (e.g. update ^14.0.0 to ^14.1.0 is allowed).
# Use --latest to go the latest versions instead.
$ pnpm update -r -i
```

[`pnpm outdated`](https://pnpm.io/cli/outdated) can be used to show outdated packages.

By default, `pnpm update` will touch both `package.json` and `pnpm-lock.yaml`.
If you only want to install newer (matching) packages and update the lockfile, without modifying `package.json` files, use `--no-save`:

```bash
# Installs newer compatible packages (according to version ranges in package.json files) and updates the lockfile.
# Does not modify the package.json files.
$ pnpm update -r --no-save
```

### Keeping dependency versions in sync

We're using [pnpm's catalog feature](https://pnpm.io/catalogs) to keep dependency versions in our `package.json` files in sync.

Central management for shared dependencies (most of them) happens in the `pnpm-workspace.yaml`.
In your `package.json`, it is usually sufficient to use `"catalog:"` as your "version".
pnpm will then automatically resolve the correct version from your catalog.

You only need to specify a version manually if you want to deviate from the catalog for some reason.

### Explaining a dependency

Use [`pnpm why`](https://pnpm.io/cli/why) to display why a certain package is a dependency (`-r` to include all packages in the workspace).
For example:

```bash
# Explains why the runtime package depedends on @formatjs/fast-memoize
$ pnpm why -r --filter runtime @formatjs/fast-memoize
# @open-pioneer/runtime@0.1.0 /home/<PROJECT_PATH>/src/packages/framework/runtime
#
# dependencies:
# @formatjs/intl 2.6.7
# ├── @formatjs/fast-memoize 1.2.8
# └─┬ intl-messageformat 10.3.1
#   └── @formatjs/fast-memoize 1.2.8
#
# devDependencies:
# @open-pioneer/test-utils link:../test-utils
# └─┬ @formatjs/intl 2.6.7
#   ├── @formatjs/fast-memoize 1.2.8
#   └─┬ intl-messageformat 10.3.1
#     └── @formatjs/fast-memoize 1.2.8
```

## Concepts

### Package manager: PNPM

Please use [`pnpm`](https://pnpm.io) instead of `npm` to manage dependencies in this repository.

Here is a list of some common commands you are likely to need:

-   `pnpm install`: Install local dependencies, for example after versions changed or a new local package has been created.
-   In a package directory: `pnpm add <DEP>`.
    Adds the dependency to the package and installs it. Use `-D` for devDependencies.
    `pnpm remove` removes a dependency again.
-   `pnpm -w <COMMAND>`: run the command in the workspace root instead of the local package.
-   `pnpm run <SCRIPT>`: runs the script from the `package.json`.
-   `pnpm exec <COMMAND>`: runs the CLI command (should be installed in node_modules), e.g. `pnpm exec -w tsc --noEmit`.

### Monorepo

We use [PNPM's workspace support](https://pnpm.io/workspaces) to manage packages in our repository.
All node packages matching the patterns configured in the `pnpm-workspace.yaml` file are included in the workspace.
Workspace packages may reference each other.

For example, the following `package-a` will be able to use `package-b`:

```jsonc
// package.json
{
    "name": "package-a",
    "dependencies": {
        "package-b": "workspace:^"
    }
}
```

`pnpm install` will resolve dependencies such as these by linking the packages to each other.
For example, `package-a/node_modules/package-b` will be a link to `package-b`'s actual location in the workspace.

### TypeScript

As a general rule, most code should be written in TypeScript.
The usage of typescript has many advantages.
It protects against bugs, improves the developer experience (autocompletion, early detection of problems, etc.) and
also ensures that type definitions and documentation for reusable libraries or bundles can be generated with little effort.

However, usage of JavaScript _is_ supported.

### UI Component Framework

We are using [Chakra UI](https://chakra-ui.com/) as our base framework to develop user interfaces.
Please import all chakra components from the `@open-pioneer/chakra-integration` package (instead of `@chakra-ui/*`).
This gives us the opportunity to set sensible defaults for some advanced use cases (such as shadow dom support).

Example:

```jsx
import { Button } from "@open-pioneer/chakra-integration";

function MyComponent() {
    return <Button>Hello World</Button>;
}
```

### Vite

[Vite](https://vitejs.dev/) is our main build tool and development server.
Custom functionalities (such as our specific Open Pioneer Trails framework package support) are developed on top of Vite via plugins.

Vite reads the configuration file `vite.config.ts` on start, which can be customized to your liking
(see [docs](https://vitejs.dev/config/)).
However, the pioneer and react plugin should not be removed from the configuration.

#### Supported Browsers

The vite config is preconfigured to support a set of common browsers ("targets", see [docs](https://vitejs.dev/config/build-options.html#build-target)).
This option influences the features used by the compiled JavaScript and CSS code.
Note that this only changes the set of _language features_ used by the output (e.g. `async`, `class`)
and not the set of Browser APIs used (that would require additional polyfills).

By default, vite assumes modern browsers with support for modules.
It is possible to support even older browsers using vite's [legacy plugin](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy).

### Testing

[Vitest](https://vitest.dev/) is used to write automated tests.
To create new tests for a source code file, simply add a `*.test.ts` (or `.tsx`, `.js`, etc.) file next to it.
It will then be automatically picked up by vitest.

Use `pnpm run test` to run the test suite.

Please refer to the [official documentation](https://vitest.dev/guide/) for more information.

### Linting and formatting

We use [Prettier](https://prettier.io/) to handle automatic source code formatting.
This keeps code readable with reasonable defaults and also ensures that we don't waste time with unproductive style discussions.
Prettier is configured by the `.prettierrc` file and it also respects parts of the `.editorconfig` file.
It can be integrated into most modern IDEs to keep automatically keep edited files formatted properly.

[ESLint](https://eslint.org/) runs within the dev server (as a vite plugin) and when pushing to the GitHub repository (within the GitHub actions workflow).
It checks the code against configured rules (see `.eslintrc`) and fails the build when it detects a code style violation.
ESLint helps to detect minor style issues (e.g. missing semicolons) and outright programming errors (e.g. wrong usage of react hooks).
