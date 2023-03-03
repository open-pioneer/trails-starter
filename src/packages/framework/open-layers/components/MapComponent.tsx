// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import Map, { MapOptions } from "ol/Map";
import { useService } from "open-pioneer:react-hooks";
import { RefObject, useEffect, useRef, useState } from "react";

export interface MapComponentProperties {
    id: string;
    mapOptions?: MapOptions;
    viewPadding?: Array<number> | undefined;
}

export function MapComponent(props: MapComponentProperties) {
    const mapElement = useRef<HTMLDivElement>(null);
    const map = useMap(props, mapElement);

    useEffect(() => {
        if (props.viewPadding && map) {
            const center = map.getView().getCenter();
            map.getView().padding = props.viewPadding;
            map.getView().animate({ center, duration: 300 });
        }
    }, [props.viewPadding, map]);

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
