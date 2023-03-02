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

export function MapApp() {
    const mapConfig = useService("config.MapConfig") as MapConfigProvider;

    const { isOpen, onToggle } = useDisclosure();

    return (
        <Flex height="100%">
            <Box
                display="flex"
                flexDirection="column"
                padding="10px"
                width={!isOpen ? "auto" : "300px"}
            >
                <LayerControlComponent showopacitySlider={isOpen}></LayerControlComponent>
                <Spacer></Spacer>
                <Button onClick={onToggle}>Toggle</Button>
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
