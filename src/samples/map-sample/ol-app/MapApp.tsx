// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Button } from "@open-pioneer/chakra-integration";
import { Sidebar } from "@open-pioneer/layout-sidebar";
import { LayerControlComponent } from "@open-pioneer/ol-layer-control";
import { MapContainer, MapPadding } from "@open-pioneer/ol-map";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { useAsync } from "react-use";

import { CoordinateComponent } from "./CoordinateComponent";
import { MAP_ID } from "./services";

const berlin = [1489200, 6894026, 1489200, 6894026];

export function MapApp() {
    const [viewPadding, setViewPadding] = useState<MapPadding>();
    const [isExpanded, setExpanded] = useState<boolean>(true);

    const olMapRegistry = useService("ol-map.MapRegistry");
    const mapState = useAsync(async () => await olMapRegistry.getMap(MAP_ID));

    const centerBerlin = () => {
        if (mapState.value) {
            mapState.value.getView().fit(berlin, { maxZoom: 13 });
        }
    };

    return (
        <div style={{ height: "100%" }}>
            <div style={{ height: "100%", position: "relative" }}>
                <MapContainer mapId={MAP_ID} viewPadding={viewPadding}></MapContainer>
                <div className="right-bottom">
                    <CoordinateComponent mapId={MAP_ID}></CoordinateComponent>
                </div>
            </div>
            <Sidebar
                defaultExpanded={isExpanded}
                expandedChanged={(expanded) => setExpanded(expanded)}
                sidebarWidthChanged={(width) => setViewPadding({ left: width / 2 })}
            >
                <LayerControlComponent
                    mapId={MAP_ID}
                    showOpacitySlider={isExpanded}
                ></LayerControlComponent>
                <Button onClick={centerBerlin}>Center Berlin</Button>
            </Sidebar>
        </div>
    );
}
