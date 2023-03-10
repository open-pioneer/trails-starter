// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { OlMapConfigurationProvider } from "@open-pioneer/open-layers-map/api";
import TileLayer from "ol/layer/Tile";
import { MapOptions } from "ol/Map";
import OSM from "ol/source/OSM";
import Stamen from "ol/source/Stamen";
import View from "ol/View";

export const MAP_ID = "main";
export class MainMapProvider implements OlMapConfigurationProvider {
    mapId = MAP_ID;

    mapOptions: MapOptions = {
        view: new View({
            projection: "EPSG:3857",
            center: [847541, 6793584],
            zoom: 14
        }),
        layers: [
            new TileLayer({
                source: new OSM(),
                properties: { title: "OSM" }
            }),
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
        // controls: [ ]
    };

    getMapOptions(): Promise<MapOptions> {
        return new Promise<MapOptions>((res) => res(this.mapOptions));
    }
}
