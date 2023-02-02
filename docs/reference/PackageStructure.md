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
export default defineBuildConfig({
    styles: "./styles.css"
});
```

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
    references?: string[];
}
```

#### `ui.references`

Lists interfaces required by UI Components.
UI Components can only use services that have previously been referenced in the `build.config.mjs`.

Example:

```js
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

## Service definition

TODO: Document class

## React Integration

### `useService` Hook

Retrieves a service implementing the given interface.
The dependency on that interface must have been declared in the `build.config.mjs` (see `ui.references`).

```js
import { useService } from "open-pioneer:react-hooks";

function ExampleComponent() {
    const service = useService("example.interface.Name");
    return <div>{service.sayHello()}</div>;
}
```

### TODO: useProperties
