# How to publish a package

This tutorial describes how to share a pioneer package with other developers.
You can skip this document if you're just working in the context of a single application.

Until now, this manual has only been concerned with building an _application_, possibly including a set of _local_ packages.
The result of building an application is always a set of static files (.i.e. `.html`, `.js`, etc.) that can be interpreted by a browser.
This output is ideal for distributing a final application, but it is not suitable for sharing reusable parts of your application.

One of the key advantages of the open pioneer client framework is the ability to scale up application development by sharing reusable application components as packages.
Shared open pioneer packages are similar to "plain" node packages (in fact, they _are_ node packages), but they come with the additional feature set you have learned already:
services of a package are automatically started when needed, styles are automatically applied, etc.

There are some things to consider and a few steps to follow when indenting to share a package with other developers.
We will first discuss the underlying concepts and then work through a specific example.

## Concepts

-   **Package Compilation**

    To prepare a package for publishing, it must be built first.
    Building a package produces a `dist` directory in that package's source directory containing a compiled version of that package.
    We use the `build-pioneer-package` CLI tool to build a package.

    This step is also called _separate (package) compilation_ since packages are compiled independently before being _linked_ into an application at a later point in time.

-   **Publishing**

    We use our node package manager to publish the contents of the `dist` directory.
    Ultimately this means executing [`pnpm publish`](https://pnpm.io/cli/publish) or something equivalent.

    The package manager will upload the compiled version of our package to the _registry_, which is the public registry of [npmjs.com](https://npmjs.com) by default (private registries such as [Nexus](https://www.sonatype.com/products/sonatype-nexus-repository) or [Verdaccio](https://verdaccio.org/) can also be used).

-   **Package installation**

    After a package has been published, it can simply be installed in any project, e.g. by executing `pnpm add`.
    Our build tools automatically detect pioneer packages in an app's dependency graph.
    A package installed this way should work the same way _as if_ it were developed locally.

### Package compilation

Our CLI tool `build-pioneer-package` implements package compilation.
It can be installed by adding [`@open-pioneer/build-package-cli`](https://www.npmjs.com/package/@open-pioneer/build-package-cli) as a (dev) dependency in your project's root `package.json`:

```bash
$ pnpm add -w -D @open-pioneer/build-package-cli
```

It is designed to be invoked from the source directory of a pioneer package and reads its configuration from that package's `package.json` and `build.config.mjs` (see [Reference](../reference/Package.md#publishconfig)).
After successful execution, it will have assembled a compiled version of that package in the `dist` directory (in that package's source directory).

`build-pioneer-package` also performs some validation to enforce best practices and to catch common errors.
By default, this validation is strict: all validation errors are fatal.
This can be changed by configuring `publishConfig.strict: false` in your package's `build.config.mjs`,
which is convenient when first preparing an existing package for publishing.
`strict` should be `true` in production!

For a properly configured package, the output of `build-pioneer-package` can look like this:

```plain
$ pnpm exec build-pioneer-package
Building package at <...>
Building JavaScript...
Generating TypeScript declaration files...
Building styles...
Copying i18n files...
Copying assets...
Writing package metadata...
Copying auxiliary files...
Success
```

As an example, this is how the `dist` directory of the [`layout-sidebar`](https://github.com/open-pioneer/openlayers-base-packages/tree/09ff758d59c97d8ead9b76af6afb1c03f765ba50/src/experimental-packages/layout-sidebar) package looks at the time of this writing:

<!-- tree -L 2 --gitignore --dirsfirst dist -->

```plain
dist
├── i18n
│   ├── de.yaml
│   └── en.yaml
├── _virtual
│   ├── _virtual-pioneer-module_react-hooks.js
│   └── _virtual-pioneer-module_react-hooks.js.map
├── CHANGELOG.md
├── index.d.ts
├── index.js
├── index.js.map
├── LICENSE
├── package.json
├── README.md
├── Sidebar.d.ts
├── Sidebar.js
├── Sidebar.js.map
├── styles.css
└── styles.css.map
```

Package compilation involves the following steps:

-   **Compile all required TypeScript/JavaScript files to JavaScript.**

    We compile everything down to JavaScript for a stable distribution format.
    This way we do not depend on a certain version of TypeScript or specifics in the `JSX` syntax.
    This also gives us the (future) opportunity to apply optimizations (e.g. minify code).

    Files that are not needed will be skipped (such as `*.test.*`).
    To decide which files are actually needed, your _must_ configure your package's `entryPoints` in the `build.config.mjs`.
    All modules used by one of your entry points (transitively) will be included in the compiled package; other modules will not.

    Most packages will simply have a single entry point (e.g. `index`), or none at all.
    If your package defines services, your services module (usually `./services`) does _not_ need to be listed: it is always automatically an entry point.

    This compilation step also ensures that packages used by your code are listed in the `package.json` as dependencies.

-   **Create type declaration files (`.d.ts`) for TypeScript consumers.**

    This way users of your package can benefit from type hints if they're using TypeScript.
    This step is enabled by default if your package contains a TypeScript source file.
    You can also force enable or disable this step by configuring `publishConfig.types` in your `build.config.mjs`.

-   **Compile styles to CSS.**

    We compile all styles (CSS or SCSS) into a single CSS file.
    This step is skipped if your package does not define any styles.

-   **Copy i18n files.**

    I18N files for supported locales (e.g. `i18n/en.yaml`) are copied to `dist`.

-   **Copy assets.**

    Assets are "normal" files that are distributed alongside your code, for example images or fonts.
    These can be configured via `publishConfig.assets`.
    Files matching any of the glob patterns in `publishConfig.assets` are simply copied to the `dist` directory.
    By default, all files in your package's `assets` directory are copied (if it exists).

-   **Generate a package.json file.**

    `build-pioneer-package` generates a custom `package.json` file for your compiled package.
    Most properties from your package's source `package.json` will simply be copied into the generated `package.json` (such as `name`, `version` and many more).

    When generating the `package.json`, `build-pioneer-package` also takes into account your package's metadata from the `build.config.mjs`: it will make entry points public (via `exports`) and include
    information about services and other open pioneer features using the `openPioneerFramework` property.

-   **Copy auxiliary files.**

By default, a package must contain the following text files:

-   `README`, `README.md` or `README.txt`
-   `LICENSE`, `LICENSE.md` or `LICENSE.txt`
-   `CHANGELOG`, `CHANGELOG.md` or `CHANGELOG.txt`

Additionally, a `NOTICE`, `NOTICE.md` or `NOTICE.txt` may be present.
All these files are copied into the compiled package.

You can configure `publishConfig.validation` to opt out of these required files.

### Publishing

Publishing a npm package has a few requirements:

1.  The package must not be set to `private`.

2.  The package must have a valid `version`.
    Note that, when using the public registry at <https://npmjs.com>, you cannot overwrite an existing version.
    You must always publish a new version instead.

3.  The package _should_ have a valid `license` and a `LICENSE` file.
    It should also contain a `README` and ideally a `CHANGELOG`.

`build-pioneer-package` will by default check the last item, and `pnpm` will by itself refuse to publish a private package or a package with an invalid version.

We're also using a pnpm-specific property called [`publishConfig.directory`](https://pnpm.io/package_json#publishconfigdirectory) for our packages.
This option tells the package manager that it shall publish the contents of the configured directory, and _not_ the source directory from where it is invoked:

```jsonc
// package.json
{
    "name": "@open-pioneer/experimental-ol-map",
    "version": "1.2.3",
    "license": "Apache-2.0",
    // ...
    "publishConfig": {
        // Tells pnpm to publish these contents instead
        // https://pnpm.io/package_json#publishconfigdirectory
        "directory": "dist",
        // Recommended as default value to avoid confusion, see
        // https://pnpm.io/package_json#publishconfiglinkdirectory
        "linkDirectory": false
    }
}
```

After making the necessary changes to your `package.json`, build the package via `build-pioneer-package`.
When that has completed successfully, the contents of the `dist` directory can be published:

```bash
# requires being logged in with the registry
$ pnpm publish
# or to explicitly make the package public (off by default for scoped packages):
$ pnpm publish --access=public
```

`pnpm publish` also accepts a `--dry-run` option to simulate publishing.
You can also execute `pnpm pack` instead to generate a `<PKG_NAME>.tgz` in the `dist` directory;
this allows you to inspect what _would be_ published to the registry.

#### Using a different registry

npm (and pnpm) will by default publish to the public registry at <https://npmjs.com>.
It can sometimes be an advantage to use another registry, for example for performance reasons (e.g. for better caching)
or to keep the code private within an organization.

There are multiple options:

-   Using a different global registry.

    All your packages will be fetched from this registry.
    The registry must therefore also act as a proxy for <https://npmjs.com>, since you still need access to all public packages.

    This is the recommended operation mode by the developers of [Verdaccio](https://verdaccio.org).

    See [here](https://verdaccio.org/docs/setup-npm) for setup instructions (which also apply to pnpm).

-   Using a different registry for one or more specific scopes.

    You will still use the default registry for all other packages, but packages from your scope (e.g. `@my-company/*`)
    would be loaded from a custom registry.

    See [here](https://docs.npmjs.com/cli/v9/using-npm/scope#associating-a-scope-with-a-registry) for setup instructions.

Depending on your chosen scenario and the software you're using you will also have to consider authentication and permission management, but that is out of scope for this document.

Neither option should have any impact on the framework itself, as long as all required packages can be downloaded.

## Walkthrough

We will create a simple package, prepare it it for publishing and then build ilt.
We skip the actual publish step as that cannot be undone (we use `--dry-run` instead).

### Step 1: Create the test package

We create a tiny package that provides a trivial `Greeter` class.
For the sake of simplicity, we do not use any services or other advanced features in our package.

We create two TypeScript files and the necessary `package.json` and `build.config.mjs` in `src/packages/test-package`.

First, the (only) entry point. This file is intended to be used from the outside.

```ts
// src/packages/test-package/index.ts
import { LOGGER } from "./logger";

export class Greeter {
    constructor() {
        LOGGER.debug("Greeter constructed");
    }

    greet(name: string) {
        return `Hello ${name}!`;
    }
}
```

An internal utility module:

```ts
// src/packages/test-package/logger.ts
import { createLogger } from "@open-pioneer/core";
export const LOGGER = createLogger("test-package");
```

The initial `package.json`:

```jsonc
// src/packages/test-package/package.json
{
    "name": "test-package",
    "main": "index.ts",
    "scripts": {
        "build": "build-pioneer-package"
    }
}
```

And the initial `build.config.mjs`

```js
// src/packages/test-package/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    publishConfig: {
        // Disable strict mode during initial setup to see more problems at the same time.
        // This should be set to `true` when we're done.
        strict: false
    }
});
```

### Step 2: Getting the package to build

You can use the `build-pioneer-package` CLI to validate your package, it will notify you about problems with your package.

To execute the command, point your terminal to the package's directory `src/packages/test-package` and then execute one of the two following commands:

```bash
$ pnpm build-pioneer-package # the manual way
$ pnpm build                 # the prepared 'build' script in package's package.json
```

Because we have disabled strict validation in the `build.config.mjs`, `build-pioneer-package` will show a lot of warnings but it will also "succeed":

```text
$ pnpm build

> test-package@ build /home/michael/projects/pioneer/starter/src/packages/test-package
> build-pioneer-package

Building package at /home/michael/projects/pioneer/starter/src/packages/test-package
/home/michael/projects/pioneer/starter/src/packages/test-package/build.config.mjs must define the 'entryPoints' property in order to be built.
Generating TypeScript declaration files...
Copying assets...
Writing package metadata...
/home/michael/projects/pioneer/starter/src/packages/test-package/package.json should define a version.
/home/michael/projects/pioneer/starter/src/packages/test-package/package.json should define a license.
/home/michael/projects/pioneer/starter/src/packages/test-package/package.json should define 'publishConfig.directory' to point to the 'dist' directory (see https://pnpm.io/package_json#publishconfigdirectory).
Copying auxiliary files...
Failed to find LICENSE in /home/michael/projects/pioneer/starter/src/packages/test-package (attempted exact match and extensions .md, .txt).
Failed to find README in /home/michael/projects/pioneer/starter/src/packages/test-package (attempted exact match and extensions .md, .txt).
Failed to find CHANGELOG in /home/michael/projects/pioneer/starter/src/packages/test-package (attempted exact match and extensions .md, .txt).
Success
```

#### Configuring entry points

Only entry point modules and modules imported by them will be included in the build package (under `dist`).
You will notice that right now, the package is empty aside from its `package.json`, because we have not configured any entry points yet.

Here is how to add them:

```diff
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
+   entryPoints: ["index"],
    publishConfig: {
        strict: false
    }
});
```

However, executing `build` now gives us a different problem:

```text
$ pnpm build

> test-package@ build /home/michael/projects/pioneer/starter/src/packages/test-package
> build-pioneer-package

Building package at /home/michael/projects/pioneer/starter/src/packages/test-package
Building JavaScript...
[plugin check-imports] Failed to import '@open-pioneer/core', the package '@open-pioneer/core' must be configured either as a dependency or as a peerDependency in /home/michael/projects/pioneer/starter/src/packages/test-package/package.json
... in logger.ts

... SNIP ...
```

We're using `createLogger` from `@open-pioneer/core` at runtime but forgot to add a dependency.
We will fix that in the next step, together with the other problems in the `package.json`.

#### Updating package.json

We're missing a `license`, a `version` and the correct `dependencies`.
We have also been told to configure `publishConfig.directory`:

```diff
// package.json
{
    "name": "test-package",
    "main": "index.ts",
+   "version": "1.0.0",
+   "license": "Apache-2.0",
    "scripts": {
        "build": "build-pioneer-package"
    },
+   "peerDependencies": {
+       "@open-pioneer/core": "^1.0.0"
+   },
+   "publishConfig": {
+       "directory": "dist",
+       "linkDirectory": false
+   }
}
```

Because the core package is a pioneer package, we have added it as a `peerDependency` (see [Best Practices](../BestPractices.md#dependency-management)).
We also added `linkDirectory: false`, see [Publishing](#publishing).

#### Adding required files

By default, `build-pioneer-package` requires LICENSE, README and CHANGELOG.
These requirements can be disabled by configuring `publishConfig.validation` in your package's `build.config.mjs`.

For this example, we just add three minimal files:

**README.md:**

```md
# test-package

Here would be your README.
```

**LICENSE:**

```plain
... Copy of the Apache-2.0 license ...
```

**CHANGELOG.md:**

```md
# Changelog test-package

## 1.0.0

-   Initial release
```

Finally, we remove `strict: false` from our `build.config.mjs`:

```diff
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    entryPoints: ["index"],
    publishConfig: {
-       strict: false
    }
});
```

#### Rebuilding the package

Building the package after all these changes should now succeed:

```bash
$ pnpm build

> test-package@1.0.0 build /home/michael/projects/pioneer/starter/src/packages/test-package
> build-pioneer-package

Building package at /home/michael/projects/pioneer/starter/src/packages/test-package
...
Success
```

### Step 3: Publishing the package

Still from your package's source directory, execute:

```bash
$ pnpm publish --access=public --dry-run --no-git-checks
npm notice
npm notice 📦  test-package@1.0.0
npm notice === Tarball Contents ===
npm notice 56B    CHANGELOG.md
npm notice 11.4kB LICENSE
npm notice 43B    README.md
npm notice 120B   index.d.ts
npm notice 224B   index.js
npm notice 610B   index.js.map
npm notice 102B   logger.d.ts
npm notice 152B   logger.js
npm notice 347B   logger.js.map
npm notice 494B   package.json
npm notice === Tarball Details ===
npm notice name:          test-package
npm notice version:       1.0.0
npm notice filename:      test-package-1.0.0.tgz
npm notice package size:  5.3 kB
npm notice unpacked size: 13.8 kB
npm notice shasum:        38047b90f3983ef3414ce45de578b992efff8f9d
npm notice integrity:     sha512-eLI0mBJ106sgE[...]5BNhucoTnwJYA==
npm notice total files:   12
npm notice
npm notice Publishing to https://registry.npmjs.org/ (dry-run)
+ test-package@1.0.0
```

`--dry-run` makes (p-)npm stop just before uploading it to the actual registry.
`--no-git-checks` allows us to use the command with a dirty working directory (this should not be used in production).

Finally, when you're ready to publish, commit and tag your release and leave out the `--dry-run` flag.

### Further reading

See also [Contributing packages to the registry](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## Checklist

-   [ ] General
    -   [ ] Don't use file names starting with "\_" if it can be avoided.
            We may add additional (internal) files or directories using that prefix, for example `_chunks` or `_virtual`.
-   [ ] package.json

    -   [ ] Choose a good package `name` and a `description`
    -   [ ] Set `private` to `false`
    -   [ ] Set a `version`
    -   [ ] Set a `license`
    -   [ ] Set `publishConfig.directory` to `dist`
    -   [ ] Maintain your `dependencies` / `peerDependencies`, see [best practices](../BestPractices.md#dependency-management)
    -   [ ] Optional: Maintain package metadata such as `keywords`, `repository`, `bugs`, `author`, `homepage` etc.

-   [ ] build.config.mjs

    -   [ ] Configure your package's entry points
    -   [ ] Customize options if needed, see [`publishConfig`](../reference/Package.md#publishconfig)
    -   [ ] Set `strict` to `true` (or remove the property to apply default)

-   [ ] Include/Update README.md
-   [ ] Include/Update CHANGELOG.md
-   [ ] Include LICENSE
-   [ ] Build with `build-pioneer-package`
-   [ ] Publish with `pnpm publish`

## Automation

We recommend automating the process of releasing your packages (and your app) as much as possible.
This has multiple advantages:

-   It reduces the possibility of human errors.
    Releases are usually complex and involve lots of small steps.
    A script cannot forget to perform those steps.
-   Automated releases are faster, making it easier to release often.
-   If a release process has been automated well, any team member can trigger a release as it requires no expert knowledge anymore.

For automatic management of your package's changelogs and versions we can recommend [Changesets](https://github.com/changesets/changesets/).
You can use their CLI as parts of your release script.
If you're using GitHub, they also provide an [Action](https://github.com/changesets/action).

pnpm's website has [a section about changesets](https://pnpm.io/using-changesets) and we're using their action successfully in some of our repositories, see [here](https://github.com/open-pioneer/openlayers-base-packages/blob/3adb59c6f28e155e43a8ace3278089e04f70185c/.github/workflows/version.yml) for example.
