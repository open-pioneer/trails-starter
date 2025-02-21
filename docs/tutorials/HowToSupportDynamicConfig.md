# How to support dynamic configuration

This tutorial describes how to support dynamic configuration in your app.

Usually, configuration is done in the `build.config.mjs` file of a package(see
[How to use properties](./HowToUseProperties.md)).
However, this configuration can not be easily changed after building an app.
This tutorial describes how it is possible to move configuration to an extra file that can easily be
changed after building an app. This is useful if you want to change the behavior of your app based
on the environment or user preferences.

In this tutorial we will use a value of a configuration file to set the title of the layer in the
map-sample app.

## Create a configuration file

First, we create a configuration file that will hold the configuration in the public vite directory.

The configuration file will be copied as is during the build process to allow the admin
to find the file and change the configuration. The file can be of any format (e.g., JSON, XML, YAML, etc.).

As an example, we create a simple JSON file holding the configuration. Therefore, we create the directory
`src/public` and add a file `config.json` with the following content:

```json
// src/public/config.json
{
    "layerTitle": "My own layer name"
}
```

The file always needs to be placed in the `src/public` directory. However, it is possible to change the public
directory configuration in the vite config (see [vite documentation](https://vite.dev/config/shared-options.html#publicdir))

## Specify the configuration object in the app

Next, we need to specify a configuration object in the app that will be used to hold the configuration loaded
from the configuration file.

Therefore, we add a properties configuration to the `build.config.mjs` file in the`src/samples/map-sample/ol-app`
directory:

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
    properties: {
        // (1)
        userConfig: null
    }
});
```

-   **(1)** Add a `properties` object to the build configuration. The `userConfig` (name is just e) property
    will hold the configuration loaded from the configuration file.

## Load the configuration file and pass the config to the app

Next, we will load the configuration file in the ol-app and pass the configuration to the app.

We need to edit the `app.ts` file in the `src/samples/map-sample/ol-app` directory.
We first receive a link to the configuration file and then (exemplary) implement the
`resolveConfig` function to load the configuration and pass it to the app.

The edited `app.ts` file should look like this:

```ts
// src/samples/map-sample/ol-app/app.ts
import { ApplicationConfig, createCustomElement } from "@open-pioneer/runtime";
import { theme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";
import configUrl from "/config.json?url"; // (1)

console.error("configUrl", configUrl);

const element = createCustomElement({
    component: MapApp,
    theme,
    appMetadata,
    async resolveConfig(): Promise<ApplicationConfig> {
        // (2)
        const config = await (await fetch(configUrl)).json(); // (2.1)
        // (2.2)
        return {
            properties: {
                "ol-app": {
                    "userConfig": config // (2.2)
                }
            }
        };
    }
});

customElements.define("ol-map-app", element);
```

-   **(1)** Receive the link to the configuration file. This works for dev and production mode.
-   **(2)** Implement the `resolveConfig` function to fetch the configuration and pass it to the app.
    -   **(2.1)** Fetch the configuration file.
    -   **(2.2)** Return the `ApplicationConfig` object.
    -   **(2.3)** Pass the fetched configuration to the app's properties (`userConfig` object) of the
        `ApplicationConfig`.

This sample is simply passing the configuration received from the file. You should think about
validating the configuration before passing it because there is a high chance for configuration
errors.

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
        // (1)
        this.layerTitle = (options.properties.userConfig as Record<string, unknown>)
            .layerTitle as string;
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

-   **(1)** Create a constructor to receive the configuration using the `ServiceOptions`. We
    pass the value of the layerTitle from the configuration to the classes `layerTitle` property.
-   **(2)** Use the `layerTitle` property to set the title of the layer in the map.
