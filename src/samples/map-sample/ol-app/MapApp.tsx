// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Spacer,
    useDisclosure
} from "@open-pioneer/chakra-integration";
import {
    CoordinateComponent,
    LayerControlComponent,
    MapContainer
} from "@open-pioneer/open-layers";
import { useService } from "open-pioneer:react-hooks";
import { useState } from "react";
import { useAsync } from "react-use";
import { MAP_ID } from "./services";

const berlin = [1489200, 6894026, 1489200, 6894026];

// TODO: use dynamic sizes
const sidebarWidthCollapsed = 150;
const sidebarWidthExpanded = 400;

export function MapApp() {
    const [viewPadding, setViewPadding] = useState<number[]>();
    // const sidebar = useRef<any>(null);

    const { isOpen, onToggle } = useDisclosure({
        onOpen() {
            // console.log(sidebar.current?.clientWidth);
            setViewPadding([0, 0, 0, sidebarWidthExpanded / 2]);
        },
        onClose() {
            // console.log(sidebar.current?.clientWidth);
            setViewPadding([0, 0, 0, sidebarWidthCollapsed / 2]);
        }
    });

    const mapPromise = useService("open-layers-map-service").getMap(MAP_ID);
    const mapState = useAsync(async () => await mapPromise);

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
            <Flex
                // ref={sidebar}
                className="sidebar"
                width={!isOpen ? `${sidebarWidthCollapsed}px` : `${sidebarWidthExpanded}px`}
            >
                <Box display="flex" width="100%" flexDirection="column" padding="10px" gap="10px">
                    <LayerControlComponent
                        mapId={MAP_ID}
                        showopacitySlider={isOpen}
                    ></LayerControlComponent>
                    <Button onClick={centerBerlin}>Center Berlin</Button>
                    <Spacer></Spacer>
                    <IconButton
                        aria-label="expand/collapse"
                        variant="ghost"
                        icon={!isOpen ? <ArrowRightIcon /> : <ArrowLeftIcon />}
                        onClick={onToggle}
                    />
                </Box>
            </Flex>
        </div>
    );
}
