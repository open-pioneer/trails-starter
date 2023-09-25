# Development Guidelines

## Definitions of Done

-   It is okay to commit to the main branch directly (pull requests or branches can of course be used when appropriate)
-   The code in main branch is supposed to build correctly and pass all quality checks (linting, typescript, etc.)
-   New features are always documented (internally and/or externally)
-   New features should be demonstrated via the demo deployment
-   We review each other's code before closing an issue
-   Automated tests are written wherever possible (and sensible)

## Code style

-   Use eslint & prettier rules (reconfigure if necessary)
-   Before a commit is successfully done, there are running some pre commit hooks running (lint, prettier, typescript compiler and tests). You can commit without these pre commit hook with the commit postfix `--no-verify`
-   Prefer const over let by default
-   Max line length is 100 columns (with some leeway)

## Git setup

-   Keep a linear history if possible.
    Use either `git pull --rebase` or setup `git config --global pull.rebase true` to make rebasing the default behavior.
-   Always use UTF-8 text encoding
-   Use Unix style newlines.
    When developing on windows, configure git to replace accidentally introduced Windows-style newlines on commit:
    `git config --global core.autocrlf input` (see <https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration>).
    If you do not want to configure this globally, it is also possible to make the setting only for a single repository:
    -   create a local folder for the project and create a new empty repository in that folder
    -   apply the newline-config in the created local git config, e.g. by executing the following commands
        using cmd in the new git folder: `git config core.eol lf`, `git config core.autocrlf input`
    -   set the online repo as origin in the local git settings, fetch all and checkout the required branch as local tracking branch

## Documentation

-   Make sure to always create sufficient documentation.
    The type of documentation required depends on the type of contribution.
-   Types of documentation:
    -   README.md in packages (each package should contain a README.md with at least information about main functionality)
    -   API doc in Code
    -   markdown documentation in docs folder (with different purposes)
        -   tutorials: tutorials for developers of apps and packages
        -   internals: for developers of the framework
        -   reference: cross-cutting concepts in detail
        -   Glossary: explanation of important terms

## Local testing without publishing

To test a new (development) version of a package `B` in package `A` without publishing, the recommended way is to use `pnpm pack`:

In package `B`, first build the package, usually via `pnpm build` or a similar command.
Then, run `pnpm pack`: this will generate a `.tgz` archive (in the package directory or its `dist` directory, depending on setup).
This archive can then be installed in package `A` like any other package by executing `pnpm install <path/to/archive>`.

Example:

```sh
# in package B
$ pnpm build
> @open-pioneer/experimental-ol-map@0.1.6 build /home/michael/projects/pioneer/openlayers-base-packages/src/experimental-packages/ol-map
> build-pioneer-package
....
Success
$ pnpm pack
/home/michael/projects/pioneer/openlayers-base-packages/src/experimental-packages/ol-map/dist/open-pioneer-experimental-ol-map-0.1.6.tgz

# in package A
$ pnpm install /home/michael/projects/pioneer/openlayers-base-packages/src/experimental-packages/ol-map/dist/open-pioneer-experimental-ol-map-0.1.6.tgz
```

Another way is to use `pnpm link` or `pnpm install /path/to/package`, but those may run into edge cases related to peer dependencies etc.

See also:

-   https://pnpm.io/cli/pack
-   https://docs.npmjs.com/cli/v9/commands/npm-pack?v=true
-   https://rimdev.io/npm-packages-and-tgz-files/
-   https://dev.to/scooperdev/use-npm-pack-to-test-your-packages-locally-486e
