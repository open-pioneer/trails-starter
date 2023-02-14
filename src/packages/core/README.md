# @open-pioneer/core

This package contains basic utility functions and classes used by the @open-pioneer project.

## Events

The package exports the `EventEmitter` class that supports emitting and subscribing to user defined events.

## Errors

The `Error` class extends JavaScript's global error class with a user defined `id` value that
can be used to explicitly identify error conditions.

```js
import { Error } from "@open-pioneer/core";
throw new Error("my-error:identifier", "This is the error message");
```

`Error` also exposes the optional `cause` attribute that allows nesting of error instances.
Note that browser support for that property is still required:

```js
import { Error, getErrorChain } from "@open-pioneer/core";

try {
    someFunctionThatCanThrow();
} catch (e) {
    throw new Error("my-error:higher-level-error-id", "Error text", { cause: e });
}

// getErrorChain gathers the error and all its causes (if any) into an array:
const errors = getErrorChain(error);
```

## Resources

The `Resource` type exported from this package is used by objects with a destructor.
All object needing some cleanup action to be called should use the `destroy` method for consistency and easier handling.
