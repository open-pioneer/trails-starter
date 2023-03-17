// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Button, Flex, Icon } from "@open-pioneer/chakra-integration";
import { Sidebar, SidebarItem } from "@open-pioneer/layout-sidebar";
import { LayerControlComponent } from "@open-pioneer/ol-layer-control";
import { MapContainer, MapPadding } from "@open-pioneer/ol-map";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { useAsync } from "react-use";
import { ScaleComponent } from "scale-component";
import { FiCodesandbox, FiLayers } from "react-icons/fi";

import { MAP_ID } from "./services";
import { ZoomComponent } from "zoom-component";

const berlin = [1489200, 6894026, 1489200, 6894026];

export function MapApp() {
    const [viewPadding, setViewPadding] = useState<MapPadding>();
    const [isExpanded, setExpanded] = useState<boolean>(false);

    const olMapRegistry = useService("ol-map.MapRegistry");
    const mapState = useAsync(async () => await olMapRegistry.getMap(MAP_ID));

    const centerBerlin = () => {
        if (mapState.value) {
            mapState.value.getView().fit(berlin, { maxZoom: 13 });
        }
    };

    const items: SidebarItem[] = [
        {
            id: "mapcontent",
            icon: <Icon as={FiLayers} />,
            label: "Karteninhalt",
            content: <LayerControlComponent mapId={MAP_ID} showOpacitySlider={true} />
        },
        {
            id: "sandbox",
            icon: <FiCodesandbox />,
            label: "Sandbox",
            content: <Button onClick={centerBerlin}>Center Berlin</Button>
        }
    ];

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            <Box>Open Pioneer - Map sample</Box>
            <Flex flex="1" direction="column" position="relative">
                <MapContainer mapId={MAP_ID} viewPadding={viewPadding}></MapContainer>
                <div className="zoom-controls">
                    <ZoomComponent mapId={MAP_ID}></ZoomComponent>
                </div>
                <Sidebar
                    defaultExpanded={isExpanded}
                    expandedChanged={(expanded) => setExpanded(expanded)}
                    sidebarWidthChanged={(width) => setViewPadding({ left: width / 2 })}
                    items={items}
                />
            </Flex>
            <Flex gap={3} alignItems="center" justifyContent="center">
                <ScaleComponent mapId={MAP_ID}></ScaleComponent>
            </Flex>
        </Flex>
    );
}
