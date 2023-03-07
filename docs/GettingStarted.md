# Getting started

## System requirements

Ensure that you have [Node](https://nodejs.org/en/) (Version 16 or later) and [pnpm](https://pnpm.io/) (Version 7.x) installed.

Assuming Node has been installed, `pnpm` can simply be installed via `npm`:

```bash
$ npm install -g pnpm
```

Other ways to install `pnpm` can be found in the [project's documentation](https://pnpm.io/installation).

## Cloning the project

Clone the repository from Github to get a copy of the code:

```bash
$ git clone https://github.com/open-pioneer/starter.git PROJECT_NAME
$ cd PROJECT_NAME
```

For the remainder of this document, we'll assume that the root of the repository (`PROJECT_NAME` in the example) is the current working directory.

## Install dependencies

Open the project directory in an IDE of your choice.
To install all the dependencies of the project run the following command:

```bash
$ pnpm install
```

## Starting the development server

To start the development server, execute the following command:

```bash
$ pnpm dev
# VITE v4.1.4 ready in 647 ms
#
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
# ➜  press h to show help
```

If you use Visual Studio Code as IDE, you can alternatively use some tasks we prepared (see `.vscode/tasks.json`).

The `dev` script (defined in `package.json`) starts [Vite's](https://vitejs.dev/) development server.
When you open the address that has been printed to the console (<http://localhost:5173/> in this case), you will be greeted by our test site (defined in `src/index.html`).

> **Note**  
> Because [pnpm](https://pnpm.io/) is our package manager, all scripts and commands should use `pnpm` instead of `npm`.

This project comes prepared with an empty application and a set of samples, all of which can be found from the test page.
The empty app is defined in `src/apps/empty` (`apps` is the location for application packages by convention).
Samples are grouped together in `src/samples/*`.
Feel free to take a look at the sample applications, or to delete them if you don't want them in your repository.

> **Note**  
> If you decide to delete the sample applications, you should also exclude them from the build.
> To do that, open Vite's configuration file `vite.config.ts` and remove the reference to `sampleSites`
> in the configuration of the `pioneer` plugin.

## Building the project

The script `pnpm run build` creates a production build of your project:

```bash
$ pnpm run build
# vite v4.1.4 building for production...
# ✓ 1453 modules transformed.
# Generated an empty chunk: "index".
# ../dist/www/samples/styling-sample/index.html       0.45 kB
# ../dist/www/sites/empty/index.html                  0.52 kB
# ../dist/www/samples/extension-sample/index.html     0.86 kB
# ../dist/www/samples/map-sample/index.html           0.99 kB
# ../dist/www/samples/i18n-sample/index.html          1.01 kB
# ../dist/www/samples/properties-sample/index.html    1.16 kB
# ../dist/www/samples/chakra-sample/index.html        1.46 kB
# ../dist/www/samples/api-sample/index.html           1.55 kB
# ../dist/www/index.html                              2.38 kB
# ...
```

All built artifacts are placed in the `dist` directory.
`dist/www` contains a ready-to-use static web application that can be hosted on all common HTTP-Servers or CDNs (Content Delivery Networks), often without any additional configuration.

The contents of your production build can be configured by editing the `pioneer` plugin settings in your `vite.config.ts`.
You can choose which `.html` sites to deploy, or which `apps` to include, depending on your environment (development, production, testing) or other settings.

Vite comes with a built-in http server to serve the content of `dist/www` on your local machine.
To start the server, simply run `pnpm preview` after building the project.

## Customizing the vite configuration

The `vite.config.ts` is designed to be customized.
It comes preconfigured with defaults to run and build the samples in this repository.
Some parts, like the `pioneer` or `react` plugins, should not be removed.
Most other sections, like the global log level or the settings of the `pioneer` plugin, can be changed at will.

A real-world application often has to support a multitude of different environments (local development, CI, staging, production, and so on).
Because the `vite.config.ts` is normal code, you can change the configuration based on rules expressed in your code.
For example, you can provide additional environment variables (e.g. backend URLs, API tokens, ...), read them in the `vite.config.ts` and possibly even use them in your application's JavaScript code (be mindful of security issues: secrets should never be embedded into the output).

More information:

-   [Vite's configuration reference](https://vitejs.dev/config/)
-   [Env files](https://vitejs.dev/guide/env-and-mode.html#env-files)

## Next steps

We recommend making yourself familiar with the contents of the empty app before you continue.
For example, you could try customizing the UI (in `src/apps/empty/AppUI.tsx`).
If you start the development server and open the app in your browser, changes to the UI will become active immediately after saving the respective file.

Recommended further reading:

-   [Guide to the repository](./RepositoryGuide.md)
-   [How to create an app](./tutorials/HowToCreateAnApp.md)
-   [How to deploy an app](./tutorials/HowToDeployAnApp.md)
