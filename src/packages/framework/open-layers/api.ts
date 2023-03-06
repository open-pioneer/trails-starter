// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { MapOptions } from "ol/Map";

/**
 * Provides an open layers map configuration with a given map id.
 */
export interface OpenlayersMapConfigurationProvider {
    /**
     * Identifier of the map.
     */
    mapId: string;

    /**
     * Returns the map options that will be applied on the corresponding map.
     */
    getMapOptions(): MapOptions;
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "open-layers-map-config.MapConfigProvider": OpenlayersMapConfigurationProvider;
    }
}
