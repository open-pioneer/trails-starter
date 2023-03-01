// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import Map, { MapOptions } from "ol/Map";
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
            const map = mapService.createMap(properties.id, properties.mapOptions);
            map.setTarget(domNode.current);
            mapRef.current = map;
            setMap(map);
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
