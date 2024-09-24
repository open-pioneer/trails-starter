# Open Pioneer Trails Starter

[![Build and deploy](https://github.com/open-pioneer/trails-starter/actions/workflows/test-and-build.yml/badge.svg)](https://github.com/open-pioneer/trails-starter/actions/workflows/test-and-build.yml) [![Audit dependencies (daily)](https://github.com/open-pioneer/trails-starter/actions/workflows/audit-dependencies.yml/badge.svg)](https://github.com/open-pioneer/trails-starter/actions/workflows/audit-dependencies.yml)

[Samples](https://open-pioneer.github.io/trails-demo/starter/) | [API Documentation](https://open-pioneer.github.io/trails-demo/starter/docs/) | [User manual](https://github.com/open-pioneer/trails-starter/tree/main/docs)

## Quick start

Ensure that you have [Node](https://nodejs.org/en/) (Version 18 or later) and [pnpm](https://pnpm.io/) (Version 9.x) installed.

Then execute the following commands to get started:

```bash
$ git clone https://github.com/open-pioneer/trails-starter.git # Clone the repository
$ cd trails-starter
$ pnpm install                                                 # Install dependencies
$ pnpm run dev                                                 # Launch development server
```

Vite will print the project's local address (usually <http://localhost:5173/>).
Point your browser at it and start programming!

Additional in-depth information can be found in the [Documentation](./docs/README.md).

## See also

-   [Core packages](https://github.com/open-pioneer/trails-core-packages): Contains the runtime package and other central packages.
-   [OpenLayers base packages](https://github.com/open-pioneer/trails-openlayers-base-packages): Contains packages using OpenLayers to render a map.
-   [Build tools](https://github.com/open-pioneer/trails-build-tools): Contains our build tooling such as the Vite plugin.

## License

Apache-2.0 (see `LICENSE` file)
