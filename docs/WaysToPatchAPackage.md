# Ways to patch a package

This document gives an overview over different techniques to change the behavior of an existing package.

## Introduction

It is sometimes necessary to modify a package in a project without the ability to trigger a release containing the desired changes.

Some possible reasons are:

-   The package contains a bug and a release that includes the fix is not (yet) available
-   An intended behavior change will not be accepted upstream but is required for the application to work
-   The package is unmaintained

Before patching a package, consider working with the upstream maintainers and send them a feature request or ask them to include your intended behavior change as a contribution.
Patching a package increases your maintenance burden, since you're often modifying internal behavior:

-   Updates may be more costly (or even impossible) because your changes need to be merged with the updated package
-   Your changes may break randomly because the assumptions you made about the package's internals are no longer true

Even if you patched a package, it is good practice (and in your own interest) to attempt to contribute your changes anyway.
A future version of the package that includes your changes would mean that you don't need to maintain your own version anymore.

With those risks in mind, choose one of the following alternatives, depending on your requirements.
When in doubt, choose the less powerful alternative, since it often comes with a smaller maintenance burden.

## Using the trails framework

If the package you attempt to modify is a trails package, you have some builtin methods to achieve that.

### Properties

Package properties can be overwritten from an application.
For example:

```ts
// src/apps/your-app/app.ts
const Element = createCustomElement({
    component: AppUI,
    appMetadata,
    config: {
        properties: {
            // Overrides the `someProperty` property in "some-package-name"`
            "some-package-name": {
                someProperty: "new-value"
            }
        }
    }
});
```

For more details, see

-   [How to use properties](...) <!-- TODO -->
-   [Package reference](./reference/Package.md)

### I18n messages

Just like properties, an app can also overwrite the i18n messages used by other packages.
For example:

```yaml
# src/apps/your-app/i18n/en.yaml
messages:
    # ...

overrides:
    # Overrides `message.id` in "some-package-name"
    some-package-name:
        message.id: "Replacement message"
```

For more details, see the [I18N format reference](./reference/I18nFormat.md).

### Services

Services cannot be replaced directly at this time.
However, an app can forcefully disable services defined by another package.
Since references between services are not based on classes, but based on interface names, you can simply substitute your own implementation.

The following example replaces the `NotificationService` (from `@open-pioneer/notifier`), which usually displays Chakra toasts, with an implementation that simply logs the messages.

To disable the service:

```js
// src/apps/your-app/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: ["en"],
    ui: {
        references: ["notifier.NotificationService"]
    },
    overrides: {
        // Package name
        "@open-pioneer/notifier": {
            services: {
                // Internal service name within the package.
                // Can be learned by inspecting the package's source code (or its compiled package.json).
                NotificationServiceImpl: {
                    // Completely removes the class from the application.
                    enabled: false
                }
            }
        }
    }
});
```

You can then implement a new version of the `NotificationService`, either in your app or in another package.
Note that this replaces the `NotificationService` in the entire application, so all packages in that application
will observe your new implementation.
It its therefore important to provide an implementation that (roughly) conforms to the original API, to avoid runtime errors.

For this example, we can simply add a new service to our application:

```js
// src/apps/your-app/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        CustomNotificationService: {
            provides: "notifier.NotificationService"
        }
    }
    // ...
});
```

And here is the implementation (based on `@open-pioneer/notifier@0.3.4`).

```ts
export class CustomNotificationService {
    // This method will be called whenever anyone in the application uses the `NotificationService`
    // to emit a notification.
    notify(options: unknown) {
        console.log("Notification", options);
    }

    // This method is an internal API used by the <Notifier /> component,
    // used to register a handler (listener) for incoming notifications.
    // If this method wouldn't exist, we would get a runtime error in the Notifier component.
    registerHandler() {
        return {
            destroy() {}
        };
    }
}
```

You can expand on this pattern by using the original service implementation in your new code, for example to wrap the original service.
The original implementation can be retrieved by importing it from the patched package's service entry point.

See also the [Service reference](./reference/Services.md) for more details.

## Copying/forking a package

One simple way to modify an existing package is to copy it into your own source tree.
This can work well in some circumstances, for example if the package provides simple functions or classes (or React components).

You can simply use the copied package instead of the original one.
Note that you can use either the package's source code or the published package code from `node_modules`.
In both cases, make sure to conform to the package's license.
Keep in mind that you may have to modify your build configuration (Vite, Linter, TypeScript, etc.) to work with the package's code (or to ignore it).

This approach stops working when _other_ packages _also_ use that packages and you want to modify _them_ as well.
For example, you can copy and modify the `@open-pioneer/runtime` all you want; other packages will still use the original version.
You need to use the package manager to achieve that (see below).

## Using the package manager

You can use pnpm to make complex changes to your packages.
pnpm's capabilities include:

-   A workflow for simple patches to another package (by applying a patch/diff file).
    This is a great alternative if you only need to change a few lines of code.
-   Changing a package's metadata, for example the `dependencies` or `peerDependencies`
-   Overriding packages and their dependencies.
    You can change packages at will in your application's entire dependency graph.

All of those features are described in [pnpm's Documentation](https://pnpm.io/).
This section contains a few practical examples.

### Using `pnpm patch`

In this example, we're going to modify the `BasemapSwitcher`'s implementation to always render layer titles in upper case.

At the time of this writing, the current version of `@open-pioneer/basemap-switcher` is `0.4.2`.
To create a patch, simply call use [pnpm patch](https://pnpm.io/cli/patch) from your terminal:

```bash
$ pnpm patch @open-pioneer/basemap-switcher
You can now edit the following folder: /tmp/f3661f760f6e544d6a19972fa9ed9132

Once you're done with your changes, run "pnpm patch-commit '/tmp/f3661f760f6e544d6a19972fa9ed9132'"
```

pnpm has created a temporary directory that contains the contents of `@open-pioneer/basemap-switcher`.
We can simply edit that directory, pnpm will track our changes.

In our case, we locate the label computation in the `useBasemapItem` hook in `BasemapSwitcher.js`:

```js
// BasemapSwitcher.js
function useBasemapItem(layer) {
    const intl = useIntl();
    const notAvailableLabel = intl.formatMessage({ id: "layerNotAvailable" });
    const label = useTitle(layer).toUpperCase(); // Patch: all labels in uppercase
    // ...
}
```

We change the label constant to always be uppercase and save the file.
Finally, we call `pnpm patch-commit`:

```bash
$ pnpm patch-commit '/tmp/f3661f760f6e544d6a19972fa9ed9132'
```

The result can be observed in the `map-sample` application:

![Map sample app with upper case basemap titles](./WaysToPatchAPackage_BasemapsUppercase.png)

#### How does it work?

pnpm computes the changes made by your edits and saves them as a patch:

```patch
# patches/@open-pioneer__basemap-switcher@0.4.2.patch
diff --git a/BasemapSwitcher.js b/BasemapSwitcher.js
index e1b45ef281a5a670a9137b85b0f0ea81c916776f..869e78329fcbf863199669508f1c7ab23a822dd8 100644
--- a/BasemapSwitcher.js
+++ b/BasemapSwitcher.js
@@ -115,7 +115,7 @@ function BasemapSelectValue(props) {
 function useBasemapItem(layer) {
   const intl = useIntl();
   const notAvailableLabel = intl.formatMessage({ id: "layerNotAvailable" });
-  const label = useTitle(layer);
+  const label = useTitle(layer).toUpperCase(); // Patch: all labels in uppercase
   const isAvailable = useLoadState(layer) !== "error";
   return {
     isAvailable,
```

It also creates a new entry in your `package.json`:

```jsonc
{
    // ...
    "pnpm": {
        "patchedDependencies": {
            "@open-pioneer/basemap-switcher@0.4.2": "patches/@open-pioneer__basemap-switcher@0.4.2.patch"
        }
    }
}
```

Both changes should be committed to your project.
`pnpm install` install will automatically apply the patch to the package whenever possible.
If that fails, for example if the package is updated and has diverged, pnpm will report an error.
You can then either re-implement the patch or drop it altogether.

Note that you can also "augment" your patch if you need to; simply re-execute `pnpm patch` for that package.

### Overriding a dependency
