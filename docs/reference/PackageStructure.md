# Package Structure

## Introduction

This document specifies the structural requirements for an open pioneer package in the source directory.

> This specification applies to both apps and "normal" packages.
> Apps are simply packages that expose a web component: they may use all package features such as services etc.

## File structure

```
src/packages/<PACKAGE_NAME>
├── build.config.mjs        # Required build system configuration file
└── package.json            # Required package metadata for (p-)npm
```

### package.json

A valid [`package.json`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json) file.
It must contain _at least_ a valid package `name`.

If the package defines services, then it should also have a main entry point (typically called `index.js` or `index.ts`) from which those services are exported.
The build system will automatically import the required service classes from the specified file.

```jsonc
// package.json
{
    "name": "sample-package",
    "main": "index"
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
    styles?: string;
    i18n?: string[];
    services?: Record<string, ServiceConfig>;
    ui?: UiConfig;
    properties?: Record<string, unknown>;
    propertiesMeta?: Record<string, PropertiesMeta>;
}
```

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

### `i18n`

An array of locales supported by the package or application.
When a package declares support for a given locale `<LOC>`, then a file named `./i18n/<LOC>.yaml` must exist.
See [I18N-Format](./I18nFormat) for more details about the format of i18n files.

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

> NOTE: The `i18n` value has an additional meaning in application packages:
> The defined languages will be the languages supported by the application, and they must either be defined
> in all packages or must be added manually in the application (via `overrides` in a `lang.yaml` file).
>
> The first language in `i18n` becomes the application's fallback language when no other language can be applied for a given user.

#### `services`

Declares services that are provided by the package.
Services will be included in the application and will automatically start when they are needed.

The name of a service must match the exported class name from the package's main entry point.

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
        // The framework will `import { LogService } from "packagename";`,
        // so a matching export must exist.
        LogService: {
            provides: "logging.LogService"
        }
    }
});
```

#### `service.provides`

Interfaces implemented by the service.
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

## Service definition

TODO: Document class

## React Integration

### `useService` Hook

Retrieves a service implementing the given interface.
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

Retrieves all services implementing the given interface as an array.
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
This attribute allows disambiguation when there are multiple services that implement the same interface.
Note that ambiguous references (references that do not exactly match a single service) are always an error.

### `referenceConfig.all`

A boolean value that indicates that the reference requires _all_ implementations of an interface.
The service (or the UI) can use the services as an array.
This attribute cannot be used together with `qualifier`.

### Examples

#### Referencing single instance

A service that requires a reference to a single other service.
There can only be a single service implementing `"example.ExampleService"`, otherwise the system will throw an error because the reference needs additional disambiguation.

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

When there are multiple implementations of an interface, the `qualifier` can be used to pick a specific one.
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

#### Referencing all implementations

All services implementing an interface can be referenced by specifying `all: true` in your `build.config.mjs`:

```js
// build.config.mjs
export default defineBuildConfig({
    services: {
        ActionServiceImpl: {
            provides: ["extension-app.ActionService"],
            references: {
                // Gathers all services that implement "extension-app.ActionProvider" as an array.
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

#### Referencing all services that implement an interface from the UI

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

```jsx
// ExampleComponent.jsx
import { useServices } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const services = useServices("some.interface.Name"); // an array
    const messages = services.map((service) => service.sayHello()).join(" - ");
    return <div>{messages}</div>;
}
```
