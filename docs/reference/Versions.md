# Versions Overview

## Introduction

The Trails ecosystem consists of a large number of packages and a few file formats.
This document summarizes the most important versions, their history and the most relevant changes.
For more detailed changes, consult the `CHANGELOG` files of the individual packages.

While the number of packages and their versions is complex, you can usually rely on the [starter repository](https://github.com/open-pioneer/trails-starter) to provide a working composition of all required components.
However, this document can be helpful when diagnosing dependency issues or when you are attempting to update parts of an application on your own.

The packages or applications described in this document are:

- **Core Packages.**

    Packages developed in the [core packages repository](https://github.com/open-pioneer/trails-core-packages).
    These packages implement the basic runtime environment of a Trails application.
    Public packages from this repository share a common version number.

- **OpenLayers Base Packages.**

    The [openlayers base packages](https://github.com/open-pioneer/trails-openlayers-base-packages) are based on OpenLayers and depend on the Trails Core Packages.
    Public packages from this repository share a common version number.

- **Vite Plugin.**

    The [vite plugin](https://www.npmjs.com/package/@open-pioneer/vite-plugin-pioneer) must be used in Trails projects to use Trails packages.
    It _reads_ package metadata (in the supported package metadata versions) and _generates_ runtime metadata for the `@open-pioneer/runtime` package.

- **Build Package CLI.**

    The [build-package-cli](https://www.npmjs.com/package/@open-pioneer/build-package-cli) compiles Trails packages before they are published. It is only relevant if you intend to distribute Trails packages.

The relevant file formats are:

- **Package Metadata.**

    Trails packages contain metadata that needs to be interpreted when building an application, or running the development server.

    Package metadata are used to implement Trails features (e.g. languages supported by a package, service provided by a package, etc.).
    They are generated when a package is built (using the build package CLI) and embedded into the package's `package.json`.

- **Runtime Metadata.**

    The runtime metadata format contains metadata about the _application_ (not just a single package).

    This information is passed from the Vite plugin to the runtime package.
    It contains all i18n messages needed by the application, references to all required services, etc.

> NOTE: You will most likely not be running into these versions in practice.
> The formats are rather stable: changes are rarely made.
> Their versions are listed here for the sake of completeness, and because their versions are not obvious (unlike `dependencies` in a `package.json` file).
> If you run into errors related to format versions, updating the Trails Vite plugin will often be the easy fix.

## Semantic Versioning

Packages and file formats follow [semantic versioning](https://semver.org/):

- Incrementing the major version indicates a breaking change to some documented behavior
- Incrementing the minor version indicates a (backward compatible) new feature
- Incrementing the patch version indicates a (backward compatible) bugfix

Major version updates happen rarely -- we aim to preserve backward compatibility.
Because some repositories (Core Packages, OpenLayers Base Packages) publish their packages with a common version, a package's major version might be incremented even if there was no breaking change for _that_ package.

Note that fixing **security issues** may force us to make breaking changes even within a minor version or patch.

## Version histories

The following tables may not list every released version.
Instead, a new entry is added when a significant change is made (any row field changes).

To locate the matching data for a specific version, simply find the entry that includes it ("Since Version X.Y.Z").

Semver expressions like `^4.6.0` have their usual meaning (">= 4.6.0 < 5.0.0" in this case).

### Core Packages

| Since Version | Package Metadata Version | Runtime Metadata Version(s) |
| ------------- | ------------------------ | --------------------------- |
| 4.6.0         | 1.0.1                    | 1.0.0, 1.1.0                |

Notes:

- Packages are _published_ using the listed package metadata version.
  They require a Vite plugin (see below) that is able to interpret that metadata.
- The package `@open-pioneer/runtime` _requires_ runtime metadata in the given format.
  It needs a Vite plugin (see below) that is able to output runtime metadata in the given format.

### OpenLayers Base Packages

| Since Version | Core Packages Version(s) | Package Metadata Version |
| ------------- | ------------------------ | ------------------------ |
| 1.3.0         | ^4.6.0                   | 1.0.1                    |

Notes:

- Packages are _published_ using the listed package metadata version.
  They require a Vite plugin (see below) that is able to interpret that metadata.

### Vite Plugin

| Since Version | Vite Version(s) | Package Metadata Versions | Runtime Metadata Version(s) |
| ------------- | --------------- | ------------------------- | --------------------------- |
| 6.0.0         | ^8.0.0          | 1.0.x, 1.1.x              | 1.0.x, 1.1.x                |

Notes:

- Multiple metadata format versions are supported (both for input and output) in order to preserve backwards compatibility but to enable new features as well.
- The runtime metadata version supported by the runtime package is detected automatically.

### Build Package CLI

| Since Version | Package Metadata Version(s) |
| ------------- | --------------------------- |
| 3.1.0         | 1.0.x, 1.1.x                |

Notes:

- The package metadata version generated for a package can be configured in the `build.config.mjs` file.
  Certain newer features may require using a newer metadata version, which may require users to update their vite plugin in order to use that package.

### Package Metadata

| Version | Comment                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | Support for the `open-pioneer:deployment` module (support introduced with @open-pioneer/vite-plugin-pioneer@6.0.0).           |
| 1.0.1   | Transports the `runtimeMeta` field, used to detect which runtime metadata format version is supported by the runtime package. |
| 1.0.0   | Original version used for all previous releases.                                                                              |

For more details about the metadata format, see [packageMetadata/v1.ts](https://github.com/open-pioneer/trails-build-tools/blob/60024a4a57b210dc51b059b42fa801b06fb7aa4f/packages/build-common/src/packageMetadata/v1.ts).

### Runtime Metadata

| Version | Comment                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1.0   | Implement support for hot reloading of i18n messages during development (support introduced with @open-pioneer/vite-plugin-pioneer@6.0.0). |
| 1.0.0   | Original version used by all previous releases.                                                                                            |

For more details about the runtime metadata format, see [runtimeSupport/index.ts](https://github.com/open-pioneer/trails-build-tools/blob/60024a4a57b210dc51b059b42fa801b06fb7aa4f/packages/build-common/src/runtimeSupport/index.ts).
