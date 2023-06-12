# Glossary

## App

An app is a [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components) produced by this framework.

Apps are defined by obtaining a custom element class from the `createCustomElement` factory function (from the runtime package), which can then be registered with the browser by calling `customElements.define(...)`.
The resulting web component can be embedded without friction into a host site by relying on the [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).

Multiple apps can be developed in the same repository.
When they are built, they share common code and assets for efficiency.

Apps are developed in application packages.

## Application package

A package that provides an app (typically in `app.js` or `app.ts`).
Application packages are also pioneer packages.

## Pioneer package

A special package type that serve as the building blocks of an app.
Pioneer packages may define and use services and UI components.
The packages used by an app are automatically linked into the application.
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

## Separate compilation

Pioneer packages may be compiled (and distributed) independently from other packages or the context of a specific application.
These packages can be linked together into an application using our build tooling.
