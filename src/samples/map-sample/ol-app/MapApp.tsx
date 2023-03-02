// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Button, Flex, Spacer, useDisclosure } from "@open-pioneer/chakra-integration";
import {
    CoordinateComponent,
    LayerControlComponent,
    MapComponent
} from "@open-pioneer/open-layers";
import { useService } from "open-pioneer:react-hooks";

import { MapConfigProvider } from "./services";
import { useAsync } from "react-use";

export function MapApp() {
    const mapConfig = useService("config.MapConfig") as MapConfigProvider;

    const { isOpen, onToggle } = useDisclosure();

    const mapPromise = useService("open-layers-map-service").getMap();
    const mapState = useAsync(async () => await mapPromise);

    const centerBerlin = () => {
        if (mapState.value) {
            mapState.value.getView().fit([1489200, 6894026, 1489200, 6894026], { maxZoom: 13 });
        }
    };

    return (
        <Flex height="100%">
            <Box
                display="flex"
                flexDirection="column"
                padding="10px"
                gap="10px"
                width={!isOpen ? "auto" : "300px"}
            >
                <LayerControlComponent showopacitySlider={isOpen}></LayerControlComponent>
                <Button onClick={centerBerlin}>Center Berlin</Button>
                <Spacer></Spacer>
                <Button onClick={onToggle}>Toggle Sidebar</Button>
            </Box>
            <Box flex="1">
                <MapComponent id="test" mapOptions={mapConfig.mapOptions}></MapComponent>
                <div className="right-bottom">
                    <CoordinateComponent></CoordinateComponent>
                </div>
            </Box>
        </Flex>
    );
}
