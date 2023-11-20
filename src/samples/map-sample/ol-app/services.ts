// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { Attribution } from "ol/control";
import TileLayer from "ol/layer/Tile";
import { MapOptions } from "ol/Map";
import OSM from "ol/source/OSM";
import View from "ol/View";

export const MAP_ID = "main";
export class MainMapProvider implements MapConfigProvider {
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
            })
        ],
        controls: [new Attribution()]
    };

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: 847541, y: 6793584 },
                zoom: 14
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "Foo",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    })
                }) 
            ]
        };
    }
}
