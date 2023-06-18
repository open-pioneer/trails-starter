# Open Pioneer Starter

![Build status](https://github.com/open-pioneer/starter/actions/workflows/test-and-build.yml/badge.svg) ![Dependency audit](https://github.com/open-pioneer/starter/actions/workflows/audit-dependencies.yml/badge.svg)

[Samples](https://open-pioneer.github.io/demo/starter/) | [API Documentation](https://open-pioneer.github.io/demo/starter/docs/) | [User manual](https://github.com/open-pioneer/starter/tree/main/docs)

## Quick start

Ensure that you have [Node](https://nodejs.org/en/) (Version 16 or later) and [pnpm](https://pnpm.io/) (Version 8.x) installed.

Then execute the following commands to get started:

```bash
$ git clone https://github.com/open-pioneer/starter.git # Clone the repository
$ cd starter
$ pnpm install                                          # Install dependencies
$ pnpm run dev                                          # Launch development server
```

Vite will print the project's local address (usually <http://localhost:5173/>).
Point your browser at it and start programming!

Additional in-depth information can be found in the [Documentation](./docs/README.md).

## See also

-   [Core packages](https://github.com/open-pioneer/core-packages): Contains the runtime package and other central packages.
-   [OpenLayers base packages](https://github.com/open-pioneer/openlayers-base-packages): Contains packages using OpenLayers to render a map.
-   [Build tools](https://github.com/open-pioneer/build-tools): Contains our build tooling such as the Vite plugin.

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
