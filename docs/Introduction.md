# Introduction

The open pioneer client framework supports the creation of client side web applications.
It offers a simple architecture where an application can be assembled from a set of packages.
Packages are reusable components that can be used in multiple applications and with different configuration.
When an application is built, it can be deployed either as a single (or multi-) page application or as an easily embeddable Web Component.

To get started developing an application, head over to [Getting Started](./GettingStarted.md).

## Technology Stack

This project is built on various high quality projects from the open source community:

-   [Vite](https://vitejs.dev/) is used as the development environment and application bundler.
-   [Vitest](https://vitest.dev/) runs our tests.
-   [React](https://reactjs.org/) provides the foundation of our UI.
-   We use accessible UI Components from [Chakra UI](https://chakra-ui.com/).
-   Applications can support multiple languages by using [FormatJS](https://formatjs.io/).
-   Framework Code is written in [TypeScript](https://www.typescriptlang.org/).
    We recommend, but do not require, TypeScript for application code as well.
-   [PNPM](https://pnpm.io/) is our package manager.
-   Finally, applications are shipped as [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
