// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { MapOptions } from "ol/Map";
import { Service } from "@open-pioneer/runtime";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Stamen from "ol/source/Stamen";

export interface MapConfigProvider {
    mapOptions?: MapOptions;
}

export class Provider implements Service<MapConfigProvider> {
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
}
