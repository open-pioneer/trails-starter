// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Coordinate, toStringXY } from "ol/coordinate";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { useAsync } from "react-use";
import { OlComponentConfig } from "@open-pioneer/open-layers-map";

// TODO: currently just showcase remove later
export function CoordinateComponent(props: OlComponentConfig) {
    const [selectedCoord, setSelectedCoord] = useState<Coordinate>();

    const olMapRegistry = useService("open-layers-map-service");
    const mapPromise = olMapRegistry.getMap(props.mapId);
    useAsync(async () => {
        const map = await mapPromise;
        map.on("click", (event: MapBrowserEvent<UIEvent>) => {
            const coords = map.getCoordinateFromPixel(event.pixel);
            if (coords) {
                const transformedCoord = transform(coords, "EPSG:3857", "EPSG:4326");
                setSelectedCoord(transformedCoord);
            }
        });
    });

    const wrapperStyle: React.CSSProperties = {
        padding: "5px"
    };

    return (
        <div>{selectedCoord && <div style={wrapperStyle}>{toStringXY(selectedCoord, 5)}</div>}</div>
    );
}
