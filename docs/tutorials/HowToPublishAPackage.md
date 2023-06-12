# How to publish a package

This tutorial describes how to share a pioneer package with other developers.
You can skip this document if you're just working in the context of a single application.

Until now, this manual has only been concerned with building an _application_, possibly including a set of _local_ packages.
The result of building an application is always a set of static files (.i.e. `.html`, `.js`, etc.) that can be interpreted by a browser.
This output is ideal for distributing a final application, but it is not suitable for sharing reusable parts of your application.

One of the key advantages of the open pioneer client framework is the ability to scale up application development by sharing reusable application components as packages.
Shared open pioneer packages are similar to "plain" node packages (in fact, they _are_ node packages), but they come with with the additional feature set you have learned already:
services of a package are automatically started when needed, styles are automatically applied, etc.

There are some things to consider and a few steps to follow when indenting to share a package with other developers.
We will first discuss the underlying concepts and then work through a specific example.

## Concepts overview

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

## Package compilation

Our CLI tool `build-pioneer-package` implements package compilation.
It can be installed by adding [`@open-pioneer/build-package-cli`](https://www.npmjs.com/package/@open-pioneer/build-package-cli) as a (dev) dependency in your project's root `package.json`:

```bash
$ pnpm add -w -D @open-pioneer/build-package-cli
```

It it designed to be invoked from the source directory of a pioneer package and reads its configuration from that package's `package.json` and `build.config.mjs` (see [Reference](../reference/Package.md#publishconfig)).
After successful execution, it will have assembled a compiled version of that package in the `dist` directory.

`build-pioneer-package` also performs some validation to enforce best practices and to catch common errors.
By default this validation is strict: all validation errors are fatal.
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
    This step also ensures that packages used by your code are listed in the `package.json` as dependencies.

    To decide which files are actually needed, your _must_ configure your package's `entryPoints` in the `build.config.mjs`.
    All modules used by one of your entry points (transitively) will be included in the compiled package; other modules will not.

    Most packages will simply have a single entry point (e.g. `index`), or none at all.
    If your package defines services, your services module (usually `./services`) does _not_ need to be listed: it is always automatically an entry point.

-   **Create type declaration files (`.d.ts`) for TypeScript consumers.**

    This way users of your package can benefit from type hints if they're using TypeScript.
    This step is enabled by default if your package contains a TypeScript source file.
    Your can also force enable or disable this step by configuring `publishConfig.types` in your `build.config.mjs`.

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

## Publishing

Publishing an npm package has a few requirements:

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

### Using a different registry

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

## Checklist

TODO rule reserved "\_FILE"

## Automation

## See also
