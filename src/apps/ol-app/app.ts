import { createCustomElement, Service } from "@open-pioneer/runtime";
import { MapOptions } from "ol/Map";
import View from "ol/View";
import { packages } from "open-pioneer:app";

import styles from "./app.css?inline";
import { MapApp } from "./MapApp";

export interface MapConfigProvider {
    mapOptions?: MapOptions;
}

const element = createCustomElement({
    component: MapApp,
    styles,
    packages: {
        ...packages,
        config: {
            name: "config",
            services: {
                Provider: {
                    name: "Provider",
                    clazz: class Provider implements Service<MapConfigProvider> {
                        mapOptions: MapOptions = {
                            view: new View({
                                projection: "EPSG:3857",
                                center: [-8255632.322029656, 4959699.061032101],
                                zoom: 12
                            })
                            // controls: [ ]
                        };
                    },
                    provides: [
                        {
                            name: "config.MapConfig"
                        }
                    ]
                }
            }
        }
    }
});

customElements.define("ol-map-app", element);
