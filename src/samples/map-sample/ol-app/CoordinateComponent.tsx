// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { OlComponentConfig } from "@open-pioneer/ol-map";
import { Coordinate, toStringXY } from "ol/coordinate";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { useAsync } from "react-use";

// TODO: currently just showcase remove later
export function CoordinateComponent(props: OlComponentConfig) {
    const [selectedCoord, setSelectedCoord] = useState<Coordinate>();

    const olMapRegistry = useService("ol-map.MapRegistry");
    useAsync(async () => {
        const map = await olMapRegistry.getMap(props.mapId);
        map.on("click", (event: MapBrowserEvent<UIEvent>) => {
            const coords = map.getCoordinateFromPixel(event.pixel);
            if (coords) {
                const transformedCoord = transform(coords, "EPSG:3857", "EPSG:4326");
                setSelectedCoord(transformedCoord);
            }
        });
    });

    return <span>{selectedCoord && <span>{toStringXY(selectedCoord, 5)}</span>}</span>;
}
