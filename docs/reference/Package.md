# Package Reference

## Introduction

This document specifies the structural requirements for an open pioneer package in the source directory.

> This specification applies to both apps and "normal" packages.
> Apps are simply packages that expose a web component: they may use all package features such as services etc.

## Application Packages

An application package is a package that provides an app.
Application packages can use all features documented below (like any other package).
Some features are only available in application packages (e.g. overriding i18n messages).

## File structure

```
src/packages/<PACKAGE_NAME>
├── build.config.mjs        # Required build system configuration file
└── package.json            # Required package metadata for (p-)npm
```

### package.json

A valid [`package.json`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json) file.
It must contain _at least_ a valid package `name`.

If the package defines services, then it must also have a services module (typically called `services.js` or `services.ts`) from which those services are exported.
The build system will automatically import the required service classes from the specified file.

```jsonc
// package.json
{
    "name": "sample-package"
}
```

### build.config.mjs

A JavaScript file that exports a configuration object for the package.
This configuration file is read and interpreted by the build system.

All configuration properties are optional.
In its most basic form, it should define an empty object:

```js
// build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({});
```

### Reference

```ts
interface BuildConfig {
    entryPoints?: string | string[];
    styles?: string;
    i18n?: string[];
    services?: Record<string, ServiceConfig>;
    servicesModule?: string;
    ui?: UiConfig;
    properties?: Record<string, unknown>;
    propertiesMeta?: Record<string, PropertiesMeta>;
    overrides?: Record<string, PackageOverridesConfig>;
    publishConfig?: PublishConfig;
}
```

#### `entryPoints`

Zero or more TypeScript (or JavaScript) entry point modules.
An entry point module is a module that can be imported from other packages.
Modules not listed here should be considered internal to the package.

This option is required when building a package with `build-pioneer-package` and optional otherwise.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    entryPoints: ["index"]
});
```

The array can also be left empty if your package does not provide any importable entities.

> NOTE: There is no need to list the [servicesModule](#servicesmodule) in here, that module automatically becomes an entry point if the package defines any services.

> NOTE: Entry point modules are currently not enforced during development,
> meaning that you can import arbitrary modules from other packages when using the vite dev server.
> This is however considered a bad practice and may be enforced in a later version.

#### `styles`

A path to a `.css` file within the package.
The file will automatically be linked into the application, and the styles will be loaded when the application runs.

Note that the `.css` file may include `@import`s to other `.css` files.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    styles: "./styles.css"
});
```

#### `i18n`

An array of locales supported by the package or application.
When a package declares support for a given locale `<LOC>`, then a file named `./i18n/<LOC>.yaml` must exist.
See [I18N-Format](./I18nFormat.md) for more details about the format of i18n files.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    // ./i18n/de.yaml and ./i18n/en.yaml must exist
    i18n: ["de", "en"]
});
```

```yaml
# i18n/en.yaml
messages:
    content:
        header: "i18n example"
```

```yaml
# i18n/de.yaml
messages:
    content:
        header: "i18n Beispiel"
```

Services and UI components will automatically receive appropriate `intl` objects from the framework for the current application locale:

-   The service constructor's `options` parameter contains `options.intl`
-   The react hook `useIntl()` (see below) provides the same `intl` object.

See [I18N Format](./I18nFormat.md) for more details.

> NOTE: The `i18n` value has an additional meaning in application packages:
> The defined languages will be the languages supported by the application, and they must either be defined
> in all packages or must be added manually in the application (via `overrides` in a `lang.yaml` file).
>
> The first language in `i18n` becomes the application's fallback language when no other language can be applied for a given user.

#### `services`

Declares services that are provided by the package.
Services will be included in the application and will automatically start when they are needed.

The name of a service must match the exported class name from the package's service module.

```ts
export interface ServiceConfig {
    provides?: string | (string | ProvidesConfig)[];
    references?: Record<string, string | ReferenceConfig>;
}
```

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        // The framework will `import { LogService } from "packageName/services";`,
        // by default, so a matching export must exist (see .js file below).
        LogService: {
            provides: "logging.LogService"
        }
    }
});
```

Make sure to export a class under the same name (`LogService` in this case):

```js
// services.js
export class LogService {
    // implementation...
}

// or:
export { LogService } from "./LogService";
```

#### `service.provides`

Interfaces provided by the service.
They can be configured as a single string (a single interface name), or an array of entries.
Every array entry can specify a string (the interface name) or an object with advanced properties.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        ServiceA: {
            provides: "example.InterfaceA"
        },
        ServiceB: {
            provides: [
                "example.InterfaceB",
                {
                    name: "example.InterfaceC"
                }
            ]
        }
    }
});
```

#### `service.references`

Interfaces referenced by the service, specified as an object of `(referenceName, referenceConfig)` entries.
These will be automatically injected by the framework into the service's constructor.
The framework will generate an error if a reference cannot be provided.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        ServiceA: {
            references: {
                // Injects the ExampleService as `example` into the service's constructor.
                example: "example.ExampleService"
            }
        }
    }
});
```

#### `servicesModule`

The name of the module that exports the package's service classes.
This value is `./services` by default, meaning that `./services.ts` or `./services.js` will be picked up automatically.

Example:

Read services from a different file:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        Foo: {
            // ...
        }
    },
    servicesModule: "./my-services-module.ts"
});
```

```ts
// my-services-module.ts
export class Foo {
    // ...
}
```

#### `ui`

Contains metadata about UI Components provided by the package.

```ts
export interface UiConfig {
    references?: (string | ReferenceConfig)[];
}
```

#### `ui.references`

Lists interfaces required by UI Components.
UI Components can only use services that have previously been referenced in the `build.config.mjs`.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    ui: {
        references: ["example.interface.Name"]
    }
});
```

#### `properties`

A record of (propertyName, value) pairs.
All valid JSON values are allowed as property values.

Properties are accessible for all services and UI components in the package.

Default property values defined here may be overwritten by the application.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    properties: {
        foo: "bar",
        nested: {
            value: "baz"
        }
    }
});
```

#### `propertiesMeta`

Contains additional metadata about properties for advanced use cases.

```ts
interface PropertyMetaConfig {
    required?: boolean;
}
```

#### `propertiesMeta.required`

Set this value to true to force the application to override this property to a non-null value.

Example:

```js
// build.config.mjs
export default defineBuildConfig({
    properties: {
        foo: null
    },
    propertiesMeta: {
        foo: {
            // Application will not start if the developer forgets
            // to initialize `foo`
            required: true
        }
    }
});
```

> Note: You cannot configure `required: true` for nested object properties at the moment.

#### `overrides`

An _application_ package may override certain entities defined in its packages.

```ts
export interface PackageOverridesConfig {
    services?: Record<string, ServiceOverridesConfig>;
}

export interface ServiceOverridesConfig {
    enabled?: boolean;
}
```

Currently, it only provides the power to completely remove the implementation of a service, for example:

```js
// build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    overrides: {
        // (1)
        "sample-package": {
            services: {
                // (2)
                GreeterImpl: {
                    // (3)
                    enabled: false
                }
            }
        }
    }
});
```

-   **(1)** The key in the `overrides` object is a package name.
-   **(2)** The key in the `services` object is a service name within that package.
-   **(3)** Disables the service (the default is always `true`).

The snippet above completely _removes_ to service called `GreeterImpl` from the package `sample-package`.
If that service provided any interfaces required by the rest of the application, the app would now be responsible
to provide alternative implementations, making this an expert feature that should not be overused.

> NOTE: It is forbidden to use `overrides` from a normal (i.e. not "application") package.

#### `publishConfig`

Additional options interpreted by the [`build-pioneer-package`](https://www.npmjs.com/package/@open-pioneer/build-package-cli) CLI when a package is built for publishing.

```ts
export interface PublishConfig {
    assets?: string | string[];
    types?: boolean;
    sourceMaps?: boolean;
    strict?: boolean;
    validation?: ValidationOptions;
}
```

#### `publishConfig.assets`

A set of [micromatch patterns](https://github.com/micromatch/micromatch#matching-features) defining asset files.
Matching files will be copied into the package's `dist` directory (using the same file name) and will therefore be available to the published package.

By default, all files in `assets/**` will be included.

> NOTE: File names starting with `.` are always ignored for security reasons.

> NOTE: Directories cannot match by themselves, you must configure a pattern that matches the individual files
> (e.g. `assets/**` instead of `assets/`).

Example:

```js
// build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    publishConfig: {
        assets: ["assets/**", "fonts/*.woff2"]
    }
});
```

#### `publishConfig.types`

Whether to generate TypeScript declaration files (`.d.ts`) for the package under compilation.
`true` by default if a TypeScript file is detected in the package, `false` otherwise.

Generating `d.ts` files requires a `tsconfig.json` in the project (or, at least, in the package).

#### `publishConfig.sourceMaps`

Enables or disables generation of [source maps](https://web.dev/source-maps/). Defaults to `true`.

Disable this option to keep your source code private.

#### `publishConfig.strict`

Enables or disables strict validation. Defaults to `true`.

Strict validation makes style issues and other warnings (e.g. missing `README`, undeclared dependencies etc.) fatal.

Disabling `strict` temporarily is helpful when starting to prepare a package for separate compilation:
all errors will be shown as warnings instead of aborting at the first error.

#### `publishConfig.validation`

Fine-tuning options for package validation.
For example, this option can be used to make `CHANGELOG` and `LICENSE` optional (they are required by default).

```ts
export interface ValidationOptions {
    requireLicense?: boolean;
    requireReadme?: boolean;
    requireChangelog?: boolean;
}
```

## Service definition

Read [Services](./Services.md) to see how services can be defined.

## React Integration

### `useService` Hook

Retrieves a service providing the given interface.
The dependency on that interface must have been declared in the `build.config.mjs` (see `ui.references`).

```jsx
// ExampleComponent.jsx
import { useService } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const service = useService("example.interface.Name");
    return <div>{service.sayHello()}</div>;
}
```

### `useServices` Hook

Retrieves all services providing the given interface as an array.
The dependency must have been declared in the `build.config.mjs` (see `ui.references`).

```jsx
// ExampleComponent.jsx
import { useServices } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const services = useServices("example.interface.Name");
    const messages = services.map((service) => service.sayHello()).join(" - ");
    return <div>{messages}</div>;
}
```

### `useProperties` Hook

Returns the properties of the calling component's package.
Note that properties can be customized by the application, so values
may not be equal to their definition in the `build.config.mjs`.

```jsx
// ExampleComponent.jsx
import { useProperties } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const properties = useProperties();
    return <div>{properties.greeting}</div>;
}
```

```js
// build.config.mjs
export default defineBuildConfig({
    properties: {
        greeting: "Hello World"
    }
});
```

### `useIntl` Hook

Returns the `intl` object for the calling component's package.
The intl object is configured for the current application locale (messages, date and number formatting, etc.).

```jsx
// ExampleComponent.jsx
import { useIntl } from "open-pioneer:react-hooks";

function ExampleComponent() {
    // Uses the content.header value defined in the section "i18n" at the top of the document
    const intl = useIntl();
    return <h1>{intl.formatMessage({ id: "content.header" })}</h1>;
}
```

See [I18N Format](./I18nFormat.md) for more details.

## Advanced service references

The `references` object in a service configuration block and the `references` array in the ui configuration block both accept a `ReferenceConfig` object for advanced use cases:

```ts
export interface ReferenceConfig {
    name: string;
    qualifier?: string;
    all?: boolean;
}
```

### `referenceConfig.name`

The interface name required by the reference.
This attribute is mandatory.

### `referenceConfig.qualifier`

The exact interface qualifier required by the reference.
This attribute allows disambiguation when there are multiple services that provide the same interface.
Note that ambiguous references (references that do not exactly match a single service) are always an error.

### `referenceConfig.all`

A boolean value that indicates that the reference requires _all_ implementations of an interface.
The service (or the UI) can use the services as an array.
This attribute cannot be used together with `qualifier`.

### Examples

#### Referencing single instance

A service that requires a reference to a single other service.
There can only be a single service providing `"example.ExampleService"`, otherwise the system will throw an error because the reference needs additional disambiguation.

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        ServiceA: {
            references: {
                example: "example.ExampleService"
            }
        }
    }
});
```

#### Referencing a single instance with qualifier

When there are multiple services providing the same interface, the `qualifier` can be used to pick a specific one.
The `qualifier` must match the value in the referenced service's `provides` section.

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        // Reference with qualifier, guaranteed to obtain the `ServiceB` instance below
        ServiceA: {
            references: {
                example: {
                    name: "example.ExampleService",
                    qualifier: "exampleQualifier"
                }
            }
        },

        // Provides with qualifier
        ServiceB: {
            provides: [
                {
                    name: "example.ExampleService",
                    qualifier: "exampleQualifier"
                }
            ]
        }
    }
});
```

#### Referencing all services providing a specific interface

All services providing an interface can be referenced by specifying `all: true` in your `build.config.mjs`:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        ActionServiceImpl: {
            provides: ["extension-app.ActionService"],
            references: {
                // Gathers all services that provide "extension-app.ActionProvider" as an array.
                providers: {
                    name: "extension-app.ActionProvider",
                    all: true
                }
            }
        },
        LoggingActionProvider: {
            provides: ["extension-app.ActionProvider"]
        },
        MultiActionProvider: {
            provides: ["extension-app.ActionProvider"]
        },
        OpenWindowActionProvider: {
            provides: ["extension-app.ActionProvider"]
        }
    }
});
```

#### Referencing a service from the UI

After declaring a reference in the `build.config.mjs`, the service can be used in a React component:

```js
// build.config.mjs
export default defineBuildConfig({
    ui: {
        references: ["some.interface.Name"]
    }
});
```

```jsx
// ExampleComponent.jsx
import { useService } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const service = useService("some.interface.Name");
    return <div>{service.sayHello()}</div>;
}
```

#### Referencing a service from the UI with qualifier

Declare the `qualifier` attribute both in your `build.config.mjs` and the `useService` call:

```js
// build.config.mjs
export default defineBuildConfig({
    ui: {
        references: [
            {
                name: "some.interface.Name",
                qualifier: "foo"
            }
        ]
    }
});
```

```jsx
// ExampleComponent.jsx
import { useService } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const service = useService("some.interface.Name", { qualifier: "foo" });
    return <div>{service.sayHello()}</div>;
}
```

#### Referencing all services that provide an interface from the UI

Gather all services that provide a certain interface name:

```js
// build.config.mjs
export default defineBuildConfig({
    ui: {
        references: [
            {
                name: "some.interface.Name",
                all: true
            }
        ]
    }
});
```

The services are gathered and available as an array in the referencing service or UI:

```jsx
// ExampleComponent.jsx
import { useServices } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const services = useServices("some.interface.Name"); // an array
    const messages = services.map((service) => service.sayHello()).join(" - ");
    return <div>{messages}</div>;
}
```

## See also

The [type declaration file](https://github.com/open-pioneer/build-tools/blob/main/packages/build-support/index.d.ts) of the `@open-pioneer/build-support` package contains additional documentation for the `defineBuildConfig(...)` function.
