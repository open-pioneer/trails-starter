// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import TileLayer from "ol/layer/Tile";
import Map, { MapOptions } from "ol/Map";
import XYZ from "ol/source/XYZ";
import View from "ol/View";
import { useService } from "open-pioneer:react-hooks";
import { RefObject, useEffect, useRef, useState } from "react";

export interface MapComponentProperties {
    id: string;
    mapOptions?: MapOptions;
}

export function MapComponent(props: MapComponentProperties) {
    const mapElement = useRef<HTMLDivElement>(null);
    useMap(props, mapElement);

    const mapContainer: React.CSSProperties = {
        height: "100%"
    };

    return <div ref={mapElement} style={mapContainer}></div>;
}

function useMap(properties: MapComponentProperties, domNode: RefObject<HTMLDivElement>) {
    const [map, setMap] = useState<Map | null>(null);
    const mapRef = useRef<Map>();
    const mapService = useService("open-layers-map-service");

    useEffect(() => {
        if (!mapRef.current && domNode.current) {
            const localConfig: MapOptions = {
                target: domNode.current,
                layers: [
                    new TileLayer({
                        source: new XYZ({
                            url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
                        })
                    })
                ],
                view: new View({
                    projection: "EPSG:3857",
                    center: [0, 0],
                    zoom: 2
                }),
                ...properties.mapOptions
            };
            const initialMap = new Map(localConfig);
            mapRef.current = initialMap;
            setMap(initialMap);
            mapService.setMap(properties.id, initialMap);
        }

        // destroy map
        return () => {
            mapRef.current?.dispose();
            mapRef.current = undefined;
            mapService.deleteMap(properties.id);
            setMap(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domNode]);

    return map;
}
