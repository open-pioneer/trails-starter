// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { OlComponentProps, useMap } from "@open-pioneer/experimental-ol-map";
import { ScaleLine } from "ol/control";
import { HTMLAttributes, useEffect, useRef } from "react";

export function ScaleComponent(props: OlComponentProps & HTMLAttributes<HTMLDivElement>) {
    const { mapId, ...rest } = props;
    const scaleElem = useRef(null);
    const { map } = useMap(mapId);

    useEffect(() => {
        if (scaleElem.current && map) {
            const currentMap = map;
            const scaleControl = new ScaleLine({
                units: "metric",
                target: scaleElem.current
            });
            currentMap.addControl(scaleControl);
            return () => {
                currentMap.removeControl(scaleControl);
            };
        }
    }, [map]);

    return <div className="scale-wrapper" ref={scaleElem} {...rest}></div>;
}
