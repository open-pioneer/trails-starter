// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import type { Resource } from "@open-pioneer/core";
import type OlMap from "ol/Map";
import type { MapOptions } from "ol/Map";

/**
 * Provides an open layers map configuration with a given map id.
 */
export interface OlMapConfigurationProvider {
    /**
     * Identifier of the map.
     */
    readonly mapId: string;

    /**
     * Returns the map options that will be applied on the corresponding map.
     */
    getMapOptions(): Promise<MapOptions>;
}

export interface OlMapRegistry {
    /**
     * Returns the map with the given id, initializing it if necessary.
     */
    getMap(mapId: string): Promise<OlMap>;

    /**
     * Registers the container for the given map.
     * This is used internally by the `MapContainer` component.
     *
     * There can only be (at most) one container per map.
     *
     * Call `.destroy()` on the returned resource to unregister the `target`.
     */
    setContainer(mapId: string, target: HTMLDivElement): Resource;
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "ol-map-config.MapConfigProvider": OlMapConfigurationProvider;
        "ol-map.MapRegistry": OlMapRegistry;
    }
}
