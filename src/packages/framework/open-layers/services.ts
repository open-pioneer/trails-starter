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
    private configProvider: Map<string, OpenlayersMapConfigurationProvider> = new Map();

    constructor(options: ServiceOptions<References>) {
        const providers = options.references.providers;
        for (const provider of providers) {
            this.configProvider.set(provider.mapId, provider);
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
        if (!this.maps.has(mapId)) {
            let additionalMapOptions = this.configProvider.get(mapId)?.getMapOptions();
            if (!additionalMapOptions) {
                LOG.warn(`config provider for map with id ${mapId} does not exist`);
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
            this.maps.set(mapId, new OlMap(defaultOptions));
        }
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Map with id ${mapId} does not exist`);
        }
        return map;
    }

    setContainer(mapId: string, elem: HTMLDivElement) {
        const map = this.maps.get(mapId);
        if (map) {
            map.setTarget(elem);
            return;
        } else {
            throw new Error(`Map with id ${mapId} does not exist`);
        }
    }
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "open-layers-map-service": OlMapRegistry;
    }
}
