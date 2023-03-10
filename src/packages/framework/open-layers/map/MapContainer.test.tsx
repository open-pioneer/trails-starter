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
import { render, screen } from "@testing-library/react";
import TileLayer from "ol/layer/Tile";
import { MapOptions } from "ol/Map";
import Stamen from "ol/source/Stamen";
import { act } from "react-dom/test-utils";
import { expect, it } from "vitest";

import { OpenlayersMapConfigurationProvider } from "./api";
import { MapContainer } from "./MapContainer";
import { OlMapRegistry } from "./services";

// used to avoid a "ResizeObserver is not defined" error
global.ResizeObserver = require("resize-observer-polyfill");

class MapConfigProvider implements OpenlayersMapConfigurationProvider {
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
        return new Promise<MapOptions>((res) => res(this.mapOptions));
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "open-layers-map-registry": service as any
        }
    };

    render(
        <PackageContextProvider {...mocks}>
            <div data-testid="base">
                <MapContainer mapId="test" />
            </div>
        </PackageContextProvider>
    );

    const div = await screen.findByTestId("base");
    expect(div).toMatchSnapshot();
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

    const mocks: PackageContextProviderProps = {
        services: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "open-layers-map-registry": service as any
        }
    };

    render(
        <PackageContextProvider {...mocks}>
            <div data-testid="base">
                <MapContainer mapId="test" />
            </div>
        </PackageContextProvider>
    );

    await act(async () => {
        const map = await service.getMap("test");
        const layers = map.getAllLayers();
        expect(layers.length).toBe(2);
        expect(layers[0]?.getProperties().title).toBe("Watercolor");
        expect(layers[1]?.getProperties().title).toBe("Toner");
    });
});
