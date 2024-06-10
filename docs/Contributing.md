# Contribution guide

Thank you for your interest in contributing to our projects!
Read our [Code of Conduct](https://github.com/open-pioneer/.github/blob/main/CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

This document contains a few notes to get you started with your contribution.

## Identify the correct repository

We develop our packages in multiple repositories.
If you already know which package you want to work on, simply follow the `repository` link of its `package.json`, which is also displayed on [npmjs.com](https://npmjs.com).
For example, the [@open-pioneer/map](https://www.npmjs.com/package/@open-pioneer/map) package links back to its repository [trails-openlayers-base-packages](https://github.com/open-pioneer/openlayers-base-packages).

Our current set of repositories is:

-   [Starter repo](https://github.com/open-pioneer/trails-starter/): Serves as a baseline for new trails projects.
    This repository also hosts the [Documentation](https://github.com/open-pioneer/trails-starter/tree/main/docs).
-   [Core packages](https://github.com/open-pioneer/trails-core-packages): Contains the runtime package and other central packages.
-   [OpenLayers base packages](https://github.com/open-pioneer/trails-openlayers-base-packages): Contains packages using OpenLayers to render a map.
-   [Build tools](https://github.com/open-pioneer/trails-build-tools): Contains our build tooling such as the Vite plugin.

## Report an issue

If you found a bug, please open an issue in an appropriate repository and provide us with clear instructions to reproduce it.
Please attach a reproducible sample that demonstrates the problem.
Good examples are:

-   a failing test case
-   a small code snippet
-   a sample repository (e.g. a fork of the starter repository)

Our repositories are configured with issue templates that can help you write a good bug report.

## Making a small change

Very small changes (such as updates to the documentation) can be done without setting up the project for local development.
Simply create a fork of the repository via GitHub's UI and apply your changes by editing the files in question in the browser.
Then, follow the instructions in [Creating a pull request](#creating-a-pull-request) to contribute your changes.

## Legal requirements

Contributing to the Open Pioneer project requires signing a Contributor License Agreement (CLA) before source code can be merged.
This can be done by your employer or by yourself.

To obtain a copy of the CLA, please email to [contact@openpioneer.dev](mailto:contact@openpioneer.dev) (We do not have an automated process in place at this time).

## Set up the project

To start with local development, take a look at [getting started](./GettingStarted.md).
Most repositories in our organization have a uniform layout, so the guide applies to them as well.
For local differences, take a look at a repository's `README`.

To get you productive quickly, here are the most important commands (note: there may be local differences per repository).

### Installing dependencies

```bash
$ pnpm install
```

### Running the local development mode

For repositories that use [Vite](https://vitejs.dev/), the following command will start the development mode.
It will start a local server and print its address, which you can then open in your browser.
The browser will keep reloading while you edit source code files, immediately rendering your changes.

```bash
$ pnpm dev

> starter@ dev /home/michael/projects/pioneer/starter
> vite


  VITE v4.5.3  ready in 606 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help

```

### Git and IDE setup

-   All text files must use UTF-8 encoding. This is usually the default.
-   All text files must use Unix line endings (`\n`).
    On windows, either configure your IDE to use Unix line endings or use git's [`autocrlf`](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) feature:

    ```bash
    $ git config --global core.autocrlf input
    ```

-   We keep a linear history in our public branches.
    You can make `rebase` the default (instead of merge) to avoid accidental merge commits.
    Note: this can also be done on a per-repository basis.

    ```bash
    $ git config --global pull.rebase true
    ```

-   Paths to JavaScript modules can get rather long on windows in combination with PNPM. If you see weird errors (I/O errors, file not found, etc.) when you're trying to install dependencies or run the development server, try moving the git repository to a shorter path on disk (less nesting, shorter name).

-   Either use eslint's autofix feature or your IDE to ensure that your files contain license headers.

    The following snippet can be used in VSCode.
    Create a snippet via "Ctrl+Shift+P --> Configure User Snippets" (either globally or in this project).
    The following example snippet appears in autocomplete when you start typing "license" in a JavaScript/TypeScript file:

    ```jsonc
    {
        "License header": {
            "scope": "javascript,typescript",
            "prefix": "license",
            "body": [
                "// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)",
                "// SPDX-License-Identifier: Apache-2.0"
            ]
        }
    }
    ```

## Creating a pull request

-   First, fork the repository via GitHub's UI and clone your fork (if you have write permissions to the repository, you can skip this step).

-   Then, create a branch with a sensible name.
    We use simple branch prefixes to keep some order:

    -   `feature/SCOPE`
    -   `fix/SCOPE`
    -   `chore/SCOPE`
    -   `docs/SCOPE`

    where `SCOPE` is up to you, but it should be a short and descriptive identifier.

-   Make your changes in one or more commits.
    We do not have a strict commit message convention.
    Most pull requests are merged by squashing all changes, so you can make as many commits as you like.

    When fixing bugs or implementing new features, make sure to include appropriate tests alongside your implementation.

    In general, make sure that automated tests (Typescript checks, unit tests, ...) are successful, otherwise your changes will not be merged.
    Tests are executed automatically when creating a commit and also when creating a pull request.
    For more details, see [Running tests](#running-tests).

-   Run `pnpm changeset` to create a description of your changes.
    This will create a file that will be used to generate a changelog entry and a future release.
    Your changeset file should list all packages that are affected by your change.
    Don't forget to include this file in your pull request.

    Go here to learn more about [Changesets](https://github.com/changesets/changesets).

    > Some changes (e.g. in configuration files) don't need a real changeset file.
    > You can generate an empty one by running `pnpm changeset add --empty` instead.

-   Push your changes into your fork (or branch) and create a pull request via GitHubs UI.
    Please give your pull request a good title and a good description.
    If your pull request addresses an issue, you should link to it from your PR's description.

## Running tests

### Checking for TypeScript errors

We use [TypeScript](https://www.typescriptlang.org/) to provide good interfaces and detect potential problems.
We recommend running TypeScript alongside your code, so you are immediately aware of any issues.

```bash
# This command keeps running and shows errors (or not) after you save a file.
$ pnpm watch-types

# This command does a one-off check and exits.
$ pnpm check-types
```

### Unit tests

We use [Vitest](https://vitest.dev/) to write our tests.
Files that are named `*.test.ts[x]` (or `js[x]`) are automatically discovered and executed:

```bash
~/projects/pioneer/core-packages$ pnpm test

> core-packages@0.0.1 test /home/michael/projects/pioneer/core-packages
> vitest


 DEV  v0.34.6 /home/michael/projects/pioneer/core-packages/src

 ✓ packages/local-storage/LocalStorageServiceImpl.test.ts (22)

 ... SNIP ...

 Test Files  22 passed (22)
      Tests  152 passed (152)
   Start at  16:11:36
   Duration  6.92s (transform 2.01s, setup 5.48s, collect 19.48s, tests 5.62s, environment 9.17s, prepare 3.87s)


 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

Vitest will keep running and will re-execute affected test cases when you change a source file.

You can also run tests of certain directories (or files) only:

```bash
# Executes only the tests found in the given directory (or file)
$ pnpm test src/packages/SOME_PACKAGE
$ pnpm test src/packages/SOME_PACKAGE/some-file.test.ts
```

For more information, see [Vitest's CLI options](https://vitest.dev/guide/cli.html).
