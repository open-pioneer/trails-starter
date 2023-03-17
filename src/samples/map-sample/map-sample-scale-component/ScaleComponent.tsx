// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { useService } from "open-pioneer:react-hooks";
import { HTMLAttributes, useEffect, useRef } from "react";
import { useAsync } from "react-use";
import { OlComponentConfig } from "@open-pioneer/ol-map";
import { ScaleLine } from "ol/control";

export function ScaleComponent(props: OlComponentConfig & HTMLAttributes<HTMLDivElement>) {
    const { mapId, ...rest } = props;
    const scaleElem = useRef(null);
    const olMapRegistry = useService("ol-map.MapRegistry");
    const map = useAsync(async () => await olMapRegistry.getMap(mapId), [mapId]);

    useEffect(() => {
        if (scaleElem.current && map.value) {
            const currmap = map.value;
            const scaleControl = new ScaleLine({
                units: "metric",
                target: scaleElem.current
            });
            currmap.addControl(scaleControl);
            return () => {
                currmap.removeControl(scaleControl);
            };
        }
    }, [map.value]);

    return <div className="scale-wrapper" ref={scaleElem} {...rest}></div>;
}
