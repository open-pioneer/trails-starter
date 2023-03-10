// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useRef } from "react";
import { useAsync } from "react-use";

export interface OlComponentConfig {
    mapId: string;
}

/**
 * Map padding, all values are pixels.
 *
 * See https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#padding
 */
export interface MapPadding {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}

export interface MapComponentProperties extends OlComponentConfig {
    /**
     * Sets the map's padding directly.
     *
     * See: https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#padding)
     */
    viewPadding?: MapPadding | undefined;
}

export function MapContainer(props: MapComponentProperties) {
    const mapElement = useRef<HTMLDivElement>(null);
    const olMapRegistry = useService("ol-map.MapRegistry");
    const mapState = useAsync(async () => await olMapRegistry.getMap(props.mapId));

    useEffect(() => {
        if (mapState.value && mapElement.current) {
            // Register div as render target
            const resource = olMapRegistry.setContainer(props.mapId, mapElement.current);
            return () => resource.destroy();
        }
    }, [mapState.value, olMapRegistry, props.mapId]);

    useEffect(() => {
        const mapView = mapState.value?.getView();
        if (props.viewPadding && mapView) {
            const center = mapView.getCenter();
            const { top = 0, right = 0, bottom = 0, left = 0 } = props.viewPadding;
            mapView.padding = [top, right, bottom, left];
            mapView.animate({ center, duration: 300 });
        }
    }, [props.viewPadding, mapState.value]);

    const mapContainer: React.CSSProperties = {
        height: "100%"
    };
    return <div className="ol-map-container" ref={mapElement} style={mapContainer}></div>;
}
