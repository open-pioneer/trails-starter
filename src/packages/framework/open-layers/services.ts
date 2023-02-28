// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import Map from "ol/Map";
import { Service } from "@open-pioneer/runtime";
import { createManualPromise, ManualPromise } from "@open-pioneer/runtime/utils";

export class OpenLayersMapService implements Service {
    private map: Map | undefined = undefined;

    private mapPromise: ManualPromise<Map> | undefined;

    getMap(): Promise<Map> {
        if (this.map) {
            return Promise.resolve(this.map);
        }
        const mapPromise = (this.mapPromise ??= createManualPromise());
        return mapPromise.promise;
    }

    deleteMap(mapId: string) {
        console.log(`deleteMap ${mapId}`);
    }

    setMap(id: string, map: Map) {
        this.map = map;
        this.mapPromise?.resolve(this.map);
    }
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "open-layers-map-service": OpenLayersMapService;
    }
}
