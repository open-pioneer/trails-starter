// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { createAbortError, createManualPromise, ManualPromise } from "@open-pioneer/core";
import { Service } from "@open-pioneer/runtime";
import TileLayer from "ol/layer/Tile";
import { default as OlMap, MapOptions } from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";

const defaultLayer = new TileLayer({ source: new OSM() });
export class OpenLayersMapService implements Service {
    private map: OlMap | undefined = undefined;

    private mapPromise: ManualPromise<OlMap> | undefined;

    destroy(): void {
        this.mapPromise?.reject(createAbortError());
    }

    getMap(): Promise<OlMap> {
        if (this.map) {
            return Promise.resolve(this.map);
        }
        const mapPromise = (this.mapPromise ??= createManualPromise());
        return mapPromise.promise;
    }

    deleteMap(mapId: string) {
        this.map = undefined;
        this.mapPromise = undefined;
    }

    createMap(mapId: string, additionalMapOptions?: MapOptions) {
        if (!this.map) {
            const options: MapOptions = {
                layers: [defaultLayer],
                view: new View({
                    projection: "EPSG:3857",
                    center: [0, 0],
                    zoom: 1
                }),
                ...additionalMapOptions
            };
            this.map = new OlMap(options);
            this.mapPromise?.resolve(this.map);
        }
        return this.map;
    }
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "open-layers-map-service": OpenLayersMapService;
    }
}
