// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * @vitest-environment jsdom
 */
import { OlMapConfigurationProvider } from "@open-pioneer/ol-map";
import { OlMapRegistry } from "@open-pioneer/ol-map/services";
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
import { expect, it } from "vitest";
import { LayerControlComponent } from "./LayerControlComponent";

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

it("should successfully create a layer control component", async () => {
    const mapConfigProvider = await createService(MapConfigProvider, {
        properties: {
            mapOptions: {
                layers: [
                    new TileLayer({
                        source: new Stamen({ layer: "watercolor" }),
                        properties: { title: "Watercolor" },
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
            "ol-map.MapRegistry": service
        }
    };

    const renderResult = render(
        <PackageContextProvider {...mocks}>
            <div data-testid="base">
                <LayerControlComponent mapId="test" />
            </div>
        </PackageContextProvider>
    );

    // Assert layer control is mounted
    const div = await screen.findByTestId("base");
    expect(div).toMatchSnapshot();

    // Check if two layer controls for the configured layers are created
    const layerElems = renderResult.container.querySelectorAll(".layer-entry");
    expect(layerElems.length).toBe(1);
    expect(layerElems[0]).toBeInstanceOf(HTMLDivElement);
});
