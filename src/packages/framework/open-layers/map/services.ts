// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { createLogger, Resource } from "@open-pioneer/core";
import { Service, ServiceOptions, ServiceType } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import OlMap, { MapOptions } from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";

import { OlMapRegistry as OlMapRegistryInterface, OlMapConfigurationProvider } from "./api";

const LOG = createLogger("open-layers:OlMapRegistry");

interface References {
    providers: ServiceType<"ol-map-config.MapConfigProvider">[];
}

export class OlMapRegistry implements Service, OlMapRegistryInterface {
    private maps: Map<string, OlMap> = new Map();
    private configProviders: Map<string, OlMapConfigurationProvider> = new Map();
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

        const options: MapOptions = {
            ...additionalMapOptions
        };

        if (!options.layers) {
            options.layers = [new TileLayer({ source: new OSM(), properties: { title: "OSM" } })];
        }

        if (!options.view) {
            options.view = new View({
                projection: "EPSG:3857",
                center: [0, 0],
                zoom: 1
            });
        }

        LOG.info(`Create map with id '${mapId}'`);
        const map = new OlMap(options);
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

    setContainer(mapId: string, target: HTMLDivElement): Resource {
        if (!target) {
            throw new Error(`Map target is not defined, so the map couldn't be mounted.`);
        }

        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Map with id '${mapId}' does not exist.`);
        }

        if (map.getTarget()) {
            throw new Error(`Map with id '${mapId}' already has a container.`);
        }

        LOG.isDebug() && LOG.debug(`Setting container of map '${mapId}':`, target);
        map.setTarget(target);
        let unregistered = false;
        return {
            destroy() {
                if (!unregistered) {
                    LOG.isDebug() && LOG.debug(`Removing container of map '${mapId}':`, target);
                    map.setTarget(undefined);
                    unregistered = true;
                }
            }
        };
    }
}
