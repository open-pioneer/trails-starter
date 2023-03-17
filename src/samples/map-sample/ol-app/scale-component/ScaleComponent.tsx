// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useRef } from "react";
import { useAsync } from "react-use";
import { OlComponentConfig } from "@open-pioneer/ol-map";
import { ScaleLine } from "ol/control";

export function ScaleComponent(props: OlComponentConfig) {
    const scaleElem = useRef(null);
    const olMapRegistry = useService("ol-map.MapRegistry");
    useAsync(async () => {
        const map = await olMapRegistry.getMap(props.mapId);
        if (scaleElem.current) {
            const scaleControl = new ScaleLine({
                units: "metric",
                target: scaleElem.current
            });
            map.addControl(scaleControl);
        }
    }, [scaleElem]);

    useEffect(() => {
        return () => {
            scaleElem.current = null;
        };
    }, []);

    return <div className="scale-wrapper" ref={scaleElem}></div>;
}
