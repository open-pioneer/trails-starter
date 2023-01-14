# Glossary

## App

Apps are the main artifact created by this setup.
They define a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that can be embedded without friction into a host site by relying on a _Shadow Dom_.

Multiple apps can be developed in the same repository.
When they are built, they share common code and assets for efficiency.

## Bundle (Term T.B.D.) <!-- TODO -->

Bundles are special packages that serve as the building blocks of an app.
Bundles may define and use services and UI components.
The bundles used by an app are automatically linked into the application.
The build system ensures that the code (and assets) required are automatically loaded.

## Package

A npm package, i.e. a directory containing at least a valid `package.json` file.

## Site

A site is an `index.html` file with associated resources (global styling, JavaScript code, favicons, etc.).
Sites rely on the builtin Vite features without any custom extensions.
They are typically used to test apps with different configurations, but they may also be shipped as a web app.

## Service

A service is an object implementing one or more interfaces.
Services are registered with the system and may be referenced by other services (or the UI).
References to services are handled by the system, which will inject appropriate service instances automatically.
