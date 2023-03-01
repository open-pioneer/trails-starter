// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Coordinate, toStringXY } from "ol/coordinate";
import { EventsKey } from "ol/events";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { unByKey } from "ol/Observable";
import { transform } from "ol/proj";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";
import { usePromise } from "react-use";

export function CoordinateComponent() {
    const [selectedCoord, setSelectedCoord] = useState<Coordinate>();
    const mounted = usePromise();
    const mapPromise = useService("open-layers-map-service").getMap();

    useEffect(() => {
        let key: EventsKey | undefined = undefined;
        (async () => {
            console.log("start useEffect");
            const map = await mounted(mapPromise);
            console.log("hasMap");
            key = map.on("click", (event: MapBrowserEvent<UIEvent>) => {
                const coords = map.getCoordinateFromPixel(event.pixel);
                if (coords) {
                    const transformedCoord = transform(coords, "EPSG:3857", "EPSG:4326");
                    setSelectedCoord(transformedCoord);
                }
            });
        })();
        return () => key && unByKey(key);
    });

    const wrapperStyle: React.CSSProperties = {
        padding: "5px"
    };

    return (
        <div>{selectedCoord && <div style={wrapperStyle}>{toStringXY(selectedCoord, 5)}</div>}</div>
    );
}
