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

## Concepts

### Monorepo

### TypeScript

### Linting and formatting

<!--

Notizen Antonia:
ESM Syntax muss genutzt werden und es werden auch nur Browser unterstützt, die das entsprechend können.
Es sollte/muss? TS genutzt werden.

-> Erläutern, was die einzelnen pnpm Befehle/Skripte machen und wann welche ausgeführt werden sollten
clean Befehl zum Löschen des Dist ordners? -> pnpm clean (erläutern, dass das bei einem Build automatisch gemacht wird)

Was sind Monorepos und wie funktioniert das ganze (bei uns im Projekt)?

Wofür ist welche Config Datei gut?

Grundlagen ES Lint

Grundlagen Prettier

Grundlagen Vite
vite.config.ts Konfigurationsdatei
Plugin-API
Welche Plugins werden genutzt und wofür?
index.html

Grundlagen Vitest

Typescript Compiler im Watch-Modus laufen lassen?



-->
