// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, Flex } from "@open-pioneer/chakra-integration";
import { MapContainer, MapPadding } from "@open-pioneer/map";
import { ScaleComponent } from "map-sample-scale-component";
import { useState } from "react";
import { MAP_ID } from "./services";

export function MapApp() {
    const [viewPadding] = useState<MapPadding>();

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            <Box textAlign="center" py={1}>
                Open Pioneer - Map sample
            </Box>
            <Flex flex="1" direction="column" position="relative">
                <MapContainer mapId={MAP_ID} viewPadding={viewPadding}></MapContainer>
            </Flex>
            <Flex gap={3} alignItems="center" justifyContent="center">
                <ScaleComponent mapId={MAP_ID}></ScaleComponent>
            </Flex>
        </Flex>
    );
}
