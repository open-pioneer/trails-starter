# Dev Guide

## Repository overview

The following figure gives a brief overview of the repository structure.

<!-- tree -L 2 --gitignore --dirsfirst -->

```
starter
├── docs                    -- Documentation
├── src                     -- Contains project code
│   ├── apps                -- Apps go here
│   ├── packages            -- Bundles and plain node packages
│   ├── types               -- TypeScript support files
│   └── index.html          -- Main HTML entry point
├── .editorconfig           -- Common text file settings (encoding, line length)
├── .eslintignore           -- Lists files ignored by ESLint
├── .eslintrc               -- ESLint configuration file
├── .gitignore              -- Lists files ignored by git
├── .prettierrc             -- Prettier configuration file
├── package.json            -- Dependencies of the root package (mostly development tools)
├── pnpm-lock.yaml          -- Package manager lockfile
├── pnpm-workspace.yaml     -- Workspaces configuration file for pnpm
├── tsconfig.json           -- Main TypeScript configuration file for the browser
├── tsconfig.node.json      -- Additional TypeScript configuration file for files running in Node
└── vite.config.ts          -- Vite configuration file
```

## Node scripts

Some frequently used tasks are implemented as scripts in the root `package.json` file.
They should be invoked via pnpm: `pnpm run <SCRIPT_NAME>` (`run` is optional if the script name is unambiguous).

### `pnpm run dev`

Launches [Vite's](https://vitejs.dev/) local development server.
The main configuration file for vite is `vite.config.ts`.

### `pnpm run watch-types`

Starts the [TypeScript compiler](https://www.typescriptlang.org/) in watch mode to detect problems during development.
It is recommended to run this script alongside the `dev` server.

### `pnpm run test`

Starts [Vitest](https://vitest.dev/) to run all automated tests.
Vitest will automatically watch all source code files and will rerun tests during development whenever it detects changes.

### `pnpm run build`

Builds the project as a static site.
Generated files are output into the `dist` directory (which is cleared on every build).
The main configuration file for vite is `vite.config.ts`.

### `pnpm run preview`

Starts a local http server serving the contents of the `dist` directory.

### `pnpm run clean`

Removes files that were created during the build (e.g. the `dist` directory).

### `pnpm run lint`

Runs [ESLint](https://eslint.org/) on all source code files to detect problems.
Simple errors can be fixed automatically by running `pnpm run lint --fix`.
ESLint is configured via the `.eslintrc` file.

### `pnpm audit`

Checks for known security issues with the installed packages. (Will also be checked with a nightly github action job)

### `pnpm run prettier`

Runs [Prettier](https://prettier.io/) on all source code files for automated (re-) formatting.
Prettier and ESLint are integrated (see `.eslintrc`), so prettier rules are also respected when linting.

### Miscellaneous tools

Installed node tools can be invoked by running `pnpm exec <TOOL_AND_OPTIONS>` (once again, the `exec` is optional).

## Common workflows

### Adding a dependency

Do install a shared build dependency (a vite plugin for example), run `pnpm add -D -w <PACKAGE_NAME>`.
`-D` will include the package as a devDependency, and `-w` will add it to the workspace root's `package.json`.

To add a dependency to a workspace package or app, execute `pnpm add PACKAGE_NAME` from the package or app directory.

You can also add the dependency manually by editing the `package.json` file directory.
Keep in mind to execute `pnpm install` to update the lockfile after you're done with editing.

### Updating a dependency

TBD

### Keeping dependency versions in sync

## Concepts

### Monorepo

We use [PNPM's workspace support](https://pnpm.io/workspaces) to lay out our repository.
All node packages matching the patterns configured in the `pnpm-workspace.yaml` file are included in the workspace.
Workspace packages may reference each other.

For example, the following `package-a` will be able to use `package-b`:

```json
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
This protects against bugs, improves the developer experience (autocompletion, early detection of problems, etc.) and
also ensures that type definitions and documentation for reusable libraries or bundles can be generated with little effort.

However, usage of JavaScript _is_ supported.

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

[ESLint](https://eslint.org/) runs within the dev server (as a vite plugin) and when pushing to the github repository (within the github actions workflow).
It checks the code against configured rules (see `.eslintrc`) and fails the build when it detects a code style violation.
ESLint helps detecting minor style issues (e.g. missing semicolons) and outright programming errors (e.g. wrong usage of react hooks).
