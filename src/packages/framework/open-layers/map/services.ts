// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { createLogger } from "@open-pioneer/core";
import { Service, ServiceOptions, ServiceType } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import OlMap, { MapOptions } from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";

import { OpenlayersMapConfigurationProvider } from "./api";

const defaultLayer = new TileLayer({ source: new OSM(), properties: { title: "OSM" } });

const LOG = createLogger("open-layers:OlMapRegistry");

interface References {
    providers: ServiceType<"open-layers-map-config.MapConfigProvider">[];
}

export class OlMapRegistry implements Service {
    private maps: Map<string, OlMap> = new Map();
    private configProviders: Map<string, OpenlayersMapConfigurationProvider> = new Map();
    private mapCreations = new Map<string, Promise<OlMap>>();

    constructor(options: ServiceOptions<References>) {
        const providers = options.references.providers;
        for (const provider of providers) {
            this.configProviders.set(provider.mapId, provider);
        }
    }

    destroy(): void {
        LOG.info(`Destroy map registry and all maps`);
        this.maps.forEach((map) => {
            map.dispose();
        });
        this.maps.clear();
    }

    async getMap(mapId: string): Promise<OlMap> {
        const existingMapCreation = this.mapCreations.get(mapId);
        if (existingMapCreation) {
            return existingMapCreation;
        }
        const map = this.maps.get(mapId);
        if (!map) {
            const mapPromise = this.createMap(mapId);
            this.mapCreations.set(mapId, mapPromise);
            return mapPromise;
        } else {
            return map;
        }
    }

    private async createMap(mapId: string) {
        let additionalMapOptions = await this.configProviders.get(mapId)?.getMapOptions();
        if (!additionalMapOptions) {
            LOG.warn(`config provider for map with id '${mapId}' does not exist`);
            additionalMapOptions = {};
        }
        const defaultOptions: MapOptions = {
            layers: [defaultLayer],
            view: new View({
                projection: "EPSG:3857",
                center: [0, 0],
                zoom: 1
            }),
            ...additionalMapOptions
        };
        LOG.info(`Create map with id '${mapId}'`);
        const map = new OlMap(defaultOptions);
        this.maps.set(mapId, map);
        this.mapCreations.delete(mapId);
        return map;
    }

    destroyMap(mapId: string): void {
        LOG.info(`Destroy map with id '${mapId}'`);
        const map = this.maps.get(mapId);
        if (map) {
            map.dispose();
            this.maps.delete(mapId);
            this.mapCreations.delete(mapId);
        } else {
            LOG.warn(`Map with id '${mapId}' does not exist, so can't be destroyed.`);
        }
    }

    setContainer(mapId: string, target: HTMLDivElement) {
        if (!target) {
            LOG.warn(`Map target is not defined, so the map couldn't be mounted.`);
            return;
        }
        const map = this.maps.get(mapId);
        if (map) {
            map.setTarget(target);
            return;
        } else {
            throw new Error(`Map with id '${mapId}' does not exist`);
        }
    }
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "open-layers-map-registry": OlMapRegistry;
    }
}
