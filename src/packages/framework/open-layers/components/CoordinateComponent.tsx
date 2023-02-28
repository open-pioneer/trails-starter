// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Coordinate, toStringXY } from "ol/coordinate";
import Map from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { unByKey } from "ol/Observable";
import { transform } from "ol/proj";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";

export function CoordinateComponent() {
    const [selectedCoord, setSelectedCoord] = useState<Coordinate>();

    const [map, setMap] = useState<Map>();
    useService("open-layers-map-service")
        .getMap()
        .then((map) => setMap(map));

    useEffect(() => {
        const key = map?.on("click", (event: MapBrowserEvent<UIEvent>) => {
            const coords = map.getCoordinateFromPixel(event.pixel);
            if (coords) {
                const transformedCoord = transform(coords, "EPSG:3857", "EPSG:4326");
                setSelectedCoord(transformedCoord);
            }
        });
        return () => key && unByKey(key);
    }, [map]);

    const wrapperStyle: React.CSSProperties = {
        padding: "5px"
    };

    return (
        <div>{selectedCoord && <div style={wrapperStyle}>{toStringXY(selectedCoord, 5)}</div>}</div>
    );
}
