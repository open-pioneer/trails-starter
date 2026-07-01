# Versioning Overview

The trails ecosystem consists of a larger number of packages and a few file formats.
This document summarizes the most important versions, their history and the most relevant changes.
For more detailed changes, consult the `CHANGELOG` files of the individual packages.

## Semantic Versioning

TODO -- Versioning policy

## Core Packages

Packages developed in the [core packages repository](https://github.com/open-pioneer/trails-core-packages) implement the basic runtime environment of our web applications.
Public packages share a common version number.

| Package Version | Package Metadata Version | Runtime Metadata Version |
| --------------- | ------------------------ | ------------------------ |
| 4.6.x           | 1.0.0                    | 1.1.0                    |

Packages are _published_ using the listed package metadata version.
They require a Vite plugin (see below) that is able to interpret that metadata.

The package `@open-pioneer/runtime` _requires_ runtime metadata in the given format.
It needs a Vite plugin (see below) that is able to output runtime metadata in the given format.

## OpenLayers Base Packages

The [openlayers base packages](https://github.com/open-pioneer/trails-openlayers-base-packages) are based on OpenLayers and the Trails Core Packages.
Public packages share a common version number.

| Package Version | Core Packages Version(s) | Package Metadata Version |
| --------------- | ------------------------ | ------------------------ |
| >= 1.3.0        | ^4.6.0                   | 1.0.0                    |

Packages are _published_ using the listed package metadata version.
They require a Vite plugin (see below) that is able to interpret that metadata.

## Vite Plugin

The [vite plugin](https://www.npmjs.com/package/@open-pioneer/vite-plugin-pioneer) must be used in trails projects to use trails packages.
It _reads_ package metadata (in the supported package metadata versions) and _generates_ runtime metadata for the `@open-pioneer/runtime` package.

Multiple metadata format versions are supported (both for input and output) in order to preserve backwards compatibility but to enable new features as well.

| Package Version | Supported Vite Version(s) | Supported Package Metadata Versions | Supported Runtime Metadata Version(s) |
| --------------- | ------------------------- | ----------------------------------- | ------------------------------------- |
| >= 6.0.0        | ^8.0.0                    | 1.0.x, 1.1.x                        | 1.0.x, 1.1.x                          |

## Build Package CLI

The [build-package-cli](https://www.npmjs.com/package/@open-pioneer/build-package-cli) compiles Trails packages before they are published.

The package metadata version generated for a package can be configured in the `build.config.mjs` file.
Certain newer features may require using a newer metadata version, which may require users to update their vite plugin in order to use that package.

| Package Version | Supported Package Metadata Version(s) |
| --------------- | ------------------------------------- |
| >= 4.2.0        | 1.0.x, 1.1.x                          |

## Package Metadata

Trails packages contain metadata that needs to be interpreted when building an application (or running the development server).
Package metadata are used to implement trails features (e.g. languages supported by a package, service provided by a package, etc.).

| Version | Comment                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | Support for the `open-pioneer:deployment` module (support introduced with @open-pioneer/vite-plugin-pioneer@6.0.0).           |
| 1.0.1   | Transports the `runtimeMeta` field, used to detect which runtime metadata format version is supported by the runtime package. |
| 1.0.0   | Original version used for all previous releases.                                                                              |

For more details about the metadata format, see [packageMetadata/v1.ts](https://github.com/open-pioneer/trails-build-tools/blob/60024a4a57b210dc51b059b42fa801b06fb7aa4f/packages/build-common/src/packageMetadata/v1.ts).

## Runtime Metadata

The runtime metadata format contains metadata about the _application_ (not just a single package).
This information is passed from the Vite plugin to the runtime package.
It contains all i18n messages needed by the application, referenced to all required services etc.

| Version | Comment                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1.0   | Implement support for hot reloading of i18n messages during development (support introduced with @open-pioneer/vite-plugin-pioneer@6.0.0). |
| 1.0.0   | Original version used by all previous releases.                                                                                            |

For more details about the runtime metadata format, see [runtimeSupport/index.ts](https://github.com/open-pioneer/trails-build-tools/blob/60024a4a57b210dc51b059b42fa801b06fb7aa4f/packages/build-common/src/runtimeSupport/index.ts).
