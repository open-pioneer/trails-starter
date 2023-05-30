// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * @vitest-environment jsdom
 */
import { ServiceOptions } from "@open-pioneer/runtime";
import {
    PackageContextProvider,
    PackageContextProviderProps
} from "@open-pioneer/test-utils/react";
import { createService } from "@open-pioneer/test-utils/services";
import { render, screen, waitFor } from "@testing-library/react";
import TileLayer from "ol/layer/Tile";
import { MapOptions } from "ol/Map";
import Stamen from "ol/source/Stamen";
import { expect, it } from "vitest";

import { OlMapConfigurationProvider } from "./api";
import { MapContainer } from "./MapContainer";
import { OlMapRegistry } from "./services";

// used to avoid a "ResizeObserver is not defined" error
global.ResizeObserver = require("resize-observer-polyfill");

class MapConfigProvider implements OlMapConfigurationProvider {
    mapId = "default";
    mapOptions: MapOptions = {};

    constructor(options: ServiceOptions) {
        if (options.properties.mapOptions) {
            this.mapOptions = options.properties.mapOptions as MapOptions;
        }
        if (options.properties.mapId) {
            this.mapId = options.properties.mapId as string;
        }
    }

    getMapOptions(): Promise<MapOptions> {
        return Promise.resolve(this.mapOptions);
    }
}

it("should successfully create a map", async () => {
    const mapConfigProvider = await createService(MapConfigProvider, {
        properties: {
            mapOptions: {} as MapOptions,
            mapId: "test"
        }
    });

    const service = await createService(OlMapRegistry, {
        references: {
            providers: [mapConfigProvider]
        }
    });

    const mocks: PackageContextProviderProps = {
        services: {
            "ol-map.MapRegistry": service
        }
    };

    const renderResult = render(
        <PackageContextProvider {...mocks}>
            <div data-testid="base">
                <MapContainer mapId="test" />
            </div>
        </PackageContextProvider>
    );

    // Assert map is mounted
    await waitFor(async () => {
        const div = await screen.findByTestId("base");
        const container = div.querySelector(".ol-viewport");
        if (!container) {
            throw new Error("Map not mounted");
        }
    });

    // Div is registered as map target
    const map = await service.getMap("test");
    const container = renderResult.container.querySelector(".ol-map-container");
    expect(container).toBeInstanceOf(HTMLDivElement);
    expect(map.getTarget()).toBe(container);

    // Unmounting removes the container from the map
    renderResult.unmount();
    expect(map.getTarget()).toBeUndefined();
});

it("should throw an error if the map container is registered twice", async () => {
    const mapId = "test";

    const mapConfigProvider = await createService(MapConfigProvider, {
        properties: {
            mapOptions: {} as MapOptions,
            mapId: mapId
        }
    });

    const service = await createService(OlMapRegistry, {
        references: {
            providers: [mapConfigProvider]
        }
    });

    const map = await service.getMap(mapId);
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");

    service.setContainer(mapId, div1);
    expect(map.getTarget()).toBe(div1);

    expect(() => service.setContainer(mapId, div2)).toThrowErrorMatchingInlineSnapshot(
        "\"Map with id 'test' already has a container.\""
    );
    expect(map.getTarget()).toBe(div1); // unchanged
});

it("should successfully create a map with given configuration", async () => {
    const mapConfigProvider = await createService(MapConfigProvider, {
        properties: {
            mapOptions: {
                layers: [
                    new TileLayer({
                        source: new Stamen({ layer: "watercolor" }),
                        properties: { title: "Watercolor" },
                        visible: false
                    }),
                    new TileLayer({
                        source: new Stamen({ layer: "toner" }),
                        properties: { title: "Toner" },
                        visible: false
                    })
                ]
            } as MapOptions,
            mapId: "test"
        }
    });

    const service = await createService(OlMapRegistry, {
        references: {
            providers: [mapConfigProvider]
        }
    });

    const map = await service.getMap("test");
    const layers = map.getAllLayers();
    expect(layers.length).toBe(2);
    expect(layers[0]?.getProperties().title).toBe("Watercolor");
    expect(layers[1]?.getProperties().title).toBe("Toner");
});
