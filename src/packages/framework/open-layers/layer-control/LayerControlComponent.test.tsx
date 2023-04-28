// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * @vitest-environment jsdom
 */
import { OlMapConfigurationProvider } from "@open-pioneer/ol-map";
import { OlMapRegistry } from "@open-pioneer/ol-map/services";
import { Service, ServiceOptions } from "@open-pioneer/runtime";
import {
    PackageContextProvider,
    PackageContextProviderProps
} from "@open-pioneer/test-utils/react";
import { createService } from "@open-pioneer/test-utils/services";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapOptions } from "ol/Map";
import TileLayer from "ol/layer/Tile";
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

async function createOlMapRegistry(mapId: string, mapOptions: MapOptions) {
    const mapConfigProvider = await createService(MapConfigProvider, {
        properties: {
            mapOptions: mapOptions,
            mapId
        }
    });
    return await createService(OlMapRegistry, {
        references: {
            providers: [mapConfigProvider]
        }
    });
}

function createPackageContextProviderProps(
    service: Service<OlMapRegistry>
): PackageContextProviderProps {
    return {
        services: {
            "ol-map.MapRegistry": service
        }
    };
}

it("should successfully create a layer control component", async () => {
    const mapId = "test";
    const mapOptions = {
        layers: [
            new TileLayer({
                source: new Stamen({ layer: "watercolor" }),
                properties: { title: "Watercolor" },
                visible: false
            })
        ]
    } as MapOptions;
    const service = await createOlMapRegistry(mapId, mapOptions);

    const renderResult = render(
        <PackageContextProvider {...createPackageContextProviderProps(service)}>
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

it("layer control should have checkbox to toggle layer visibility", async () => {
    const mapId = "test";
    const mapOptions = {
        layers: [
            new TileLayer({
                source: new Stamen({ layer: "watercolor" }),
                properties: { title: "Watercolor" },
                visible: false
            })
        ]
    } as MapOptions;
    const service = await createOlMapRegistry(mapId, mapOptions);
    const user = userEvent.setup();
    render(
        <PackageContextProvider {...createPackageContextProviderProps(service)}>
            <LayerControlComponent mapId={mapId} showOpacitySlider={true} />
        </PackageContextProvider>
    );

    // pre check visibility of the layer
    const map = await service.getMap(mapId);
    const layers = map.getAllLayers();
    expect(layers.length).toBe(1);
    const firstLayer = layers[0]!;
    expect(firstLayer.getVisible()).toBe(false);

    // adjust visibility by control
    const checkbox = await screen.findByRole("checkbox");
    await user.click(checkbox);
    expect(firstLayer.getVisible()).toBe(true);
});

it("layer control should have usable opacity slider", async () => {
    const mapId = "test";
    const mapOptions = {
        layers: [
            new TileLayer({
                source: new Stamen({ layer: "watercolor" }),
                properties: { title: "Watercolor" },
                visible: false
            })
        ]
    } as MapOptions;
    const service = await createOlMapRegistry(mapId, mapOptions);
    const user = userEvent.setup();
    render(
        <PackageContextProvider {...createPackageContextProviderProps(service)}>
            <LayerControlComponent mapId={mapId} showOpacitySlider={true} />
        </PackageContextProvider>
    );

    // pre check opacity in layer
    const map = await service.getMap(mapId);
    const layers = map.getAllLayers();
    expect(layers.length).toBe(1);
    const firstLayer = layers[0]!;
    expect(firstLayer.getOpacity()).toBe(1);

    // adjust opacity by control
    const slider = await screen.findByRole("slider");
    await act(async () => {
        slider.focus();
        await user.keyboard("[ArrowLeft]");
        expect(firstLayer.getOpacity()).toBeCloseTo(0.99);
    });
});
