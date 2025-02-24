# How to support dynamic configuration

This tutorial describes how to support dynamic configuration in your app.

Usually, configuration is done in the `build.config.mjs` file of a package (see [How to use properties](./HowToUseProperties.md)).
However, this configuration can not be easily changed after building an app.
This tutorial describes how you can move configuration to a separate file that can easily be accessed and changed after building an app.
This is useful if you want to change the behavior of your app based on the environment or user preferences.

In this tutorial we will create a configuration file and use a value derived from the file
to set the title of a layer in the map-sample app.

## Create a configuration file

First, we create a configuration file in the `public` vite directory.

The configuration file will be copied _as is_ during the build process to allow the admin to find the file and change the configuration.
The file can be of any format you prefer (e.g., JSON, XML, YAML, etc.).

As an example, we will use a simple JSON file to hold the configuration.
We create the directory `src/public` and add a file `config.json` with the following content:

```json
// src/public/config.json
{
    "layerTitle": "My own layer name"
}
```

The configuration file always needs to be placed in the `src/public` directory (or in a subdirectory of this directory).
However, it is possible to change the `public` directory's location via Vite (see [vite documentation](https://vite.dev/config/shared-options.html#publicdir)).

## Specify the configuration object in the app

Next, we need to specify a configuration object in the app that will be used to hold the configuration loaded from the configuration file.

We add a `properties` configuration to the `build.config.mjs` file in the `src/samples/map-sample/ol-app` directory:

```js
// src/samples/map-sample/ol-app/build.config.mjs
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "./app.css",
    i18n: ["en", "de"],
    services: {
        MainMapProvider: {
            provides: ["map.MapConfigProvider"]
        }
    },
    // (1)
    properties: {
        userConfig: null
    }
});
```

- **(1)** Add a `properties` object to the build configuration.
  The `userConfig` (name is just for illustration) property will hold the configuration loaded from the configuration file.

## Load the configuration file and pass the config to the app

Next, we will load the configuration file and pass the configuration to the app.

We need to edit the `app.ts` file in the `src/samples/map-sample/ol-app` directory.
We first receive an URL to the configuration file and then (as an example) implement the `resolveConfig` function to load the configuration and pass it to the app.

The edited `app.ts` file should look like this:

```ts
// src/samples/map-sample/ol-app/app.ts
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";
import configUrl from "/config.json?url"; // (1)

const element = createCustomElement({
    component: MapApp,
    theme,
    appMetadata,
    async resolveConfig(): Promise<ApplicationConfig> {
        // (2)
        const response = await fetch(configUrl);
        const config = await response.json(); // (2.1)

        return {
            // (2.2)
            properties: {
                "ol-app": {
                    "userConfig": config // (2.3)
                }
            }
        };
    }
});

customElements.define("ol-map-app", element);
```

- **(1)** Receive the URL to the configuration file.
  The URL is resolved by Vite (see [documentation](https://vite.dev/guide/assets#explicit-url-imports)) and will work both during development and in production.
- **(2)** Implement the `resolveConfig` function to fetch the configuration and pass it to the app.
    - **(2.1)** Fetch the configuration file and parse it.
    - **(2.2)** Specify package properties during application start.
    - **(2.3)** Pass the configuration to the app package's properties (`userConfig` object) of the `ApplicationConfig`.

This sample is simply passing the configuration received from the file.
If the file will be edited by non-expert users or if your file format becomes complicated, you may want to implement some form of validation.
The following libraries may help you to prevent configuration errors:

- [zod](https://zod.dev/)
- [valibot](https://valibot.dev/)
- [ajv](https://ajv.js.org/)

## Use the configuration in the app

Finally, we can use the configuration in the app.
As an example we will use the configuration to set the title of the layer in the map-sample app.

In the sample app, the `services.ts` file holds the configuration for the map.
We edit this file to pass the layer title from the configuration to the map's OSM layer.

```ts
// src/samples/map-sample/ol-app/services.ts
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { ServiceOptions } from "@open-pioneer/runtime";

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
    mapId = MAP_ID;
    private layerTitle: string;

    constructor(options: ServiceOptions) {
        const userConfig = options.properties.userConfig as Record<string, unknown>;
        this.layerTitle = userConfig.layerTitle as string; // (1)
    }

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 847541, y: 6793584 },
                zoom: 14
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: this.layerTitle, // (2)
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                })
            ]
        };
    }
}
```

- **(1)** Create a constructor to receive the configuration using the `ServiceOptions`.
  We pass the value of the `layerTitle` from the configuration to the property `this.layerTitle`.
- **(2)** Use the value of `this.layerTitle` property to set the title of the map's layer.

## Building the application for production

So far we have only worked in the development environment.
Run `pnpm build` to build the application for production.
Vite will copy the configuration file (and all other files in `src/public`) into the output directory at `dist/www` alongside the rest of your application.
Note that, other than JavaScript assets or assets imported from directories different than `src/public`, the name of the configuration file is not hashed or modified in any other way:

```text
dist/www
├── assets
├── samples
├── sites
├── config.json     # Exactly the same path as the original file (relative to src/public)
└── index.html
```

Verify that everything works as intended by serving your built application:

```bash
pnpm preview
```

Your application will load the configuration file at startup.
Changing the content of `dist/www/config.json` will be reflected after a reload.

## Further reading

- [How to use properties](./HowToUseProperties.md)
- Vite documentation: [Static Assert Handling](https://vite.dev/guide/assets)
- Vite documentation: [publicDir option](https://vite.dev/config/shared-options.html#publicdir)
