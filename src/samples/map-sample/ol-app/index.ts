import { MapOptions } from "ol/Map";
import { Service } from "@open-pioneer/runtime";
import View from "ol/View";

export interface MapConfigProvider {
    mapOptions?: MapOptions;
}

export class Provider implements Service<MapConfigProvider> {
    mapOptions: MapOptions = {
        view: new View({
            projection: "EPSG:3857",
            center: [-8255632.322029656, 4959699.061032101],
            zoom: 12
        })
        // controls: [ ]
    };
}
