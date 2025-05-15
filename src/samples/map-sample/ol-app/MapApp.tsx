// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, Flex, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { BasemapSwitcher } from "@open-pioneer/basemap-switcher";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { Geolocation } from "@open-pioneer/geolocation";
import { DefaultMapProvider, MapAnchor, MapContainer } from "@open-pioneer/map";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { ToolButton } from "@open-pioneer/map-ui-components";
import { Measurement } from "@open-pioneer/measurement";
import { Notifier } from "@open-pioneer/notifier";
import { OverviewMap } from "@open-pioneer/overview-map";
import { SectionHeading, TitledSection } from "@open-pioneer/react-utils";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { useIntl } from "open-pioneer:react-hooks";
import { useId, useMemo, useState } from "react";
import { PiRulerLight } from "react-icons/pi";
import { MAP_ID } from "./services";

export function MapApp() {
    const intl = useIntl();
    const measurementTitleId = useId();

    const [measurementIsActive, setMeasurementIsActive] = useState<boolean>(false);
    function toggleMeasurement() {
        setMeasurementIsActive(!measurementIsActive);
    }

    const overviewMapLayer = useMemo(
        () =>
            new TileLayer({
                source: new OSM()
            }),
        []
    );

    return (
        <Flex height="100%" direction="column" overflow="hidden">
            <Notifier />
            <TitledSection
                title={
                    <Box
                        role="region"
                        aria-label={intl.formatMessage({ id: "ariaLabel.header" })}
                        textAlign="center"
                        py={1}
                    >
                        <SectionHeading size={"md"}>
                            Open Pioneer Trails - Map Sample
                        </SectionHeading>
                    </Box>
                }
            >
                <DefaultMapProvider mapId={MAP_ID}>
                    <Flex flex="1" direction="column" position="relative">
                        <MapContainer
                            role="main"
                            aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                        >
                            <MapAnchor position="top-left" horizontalGap={5} verticalGap={5}>
                                {measurementIsActive && (
                                    <Box
                                        backgroundColor="white"
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        padding={2}
                                        boxShadow="lg"
                                        role="top-left"
                                        aria-label={intl.formatMessage({ id: "ariaLabel.topLeft" })}
                                    >
                                        <Box role="dialog" aria-labelledby={measurementTitleId}>
                                            <TitledSection
                                                title={
                                                    <SectionHeading
                                                        id={measurementTitleId}
                                                        size="md"
                                                        mb={2}
                                                    >
                                                        {intl.formatMessage({
                                                            id: "measurementTitle"
                                                        })}
                                                    </SectionHeading>
                                                }
                                            >
                                                <Measurement />
                                            </TitledSection>
                                        </Box>
                                    </Box>
                                )}
                            </MapAnchor>
                            <MapAnchor position="top-right" horizontalGap={5} verticalGap={5}>
                                <Box
                                    backgroundColor="white"
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    padding={2}
                                    boxShadow="lg"
                                    role="top-right"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.topRight" })}
                                >
                                    <OverviewMap olLayer={overviewMapLayer} />
                                    <Separator mt={4} />
                                    <BasemapSwitcherComponent />
                                </Box>
                            </MapAnchor>
                            <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                                <Flex
                                    role="bottom-right"
                                    aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                                    direction="column"
                                    gap={1}
                                    padding={1}
                                >
                                    <ToolButton
                                        label={intl.formatMessage({ id: "measurementTitle" })}
                                        icon={<PiRulerLight />}
                                        active={measurementIsActive}
                                        onClick={toggleMeasurement}
                                    />
                                    <Geolocation />
                                    <InitialExtent />
                                    <ZoomIn />
                                    <ZoomOut />
                                </Flex>
                            </MapAnchor>
                        </MapContainer>
                    </Flex>
                    <Flex
                        role="region"
                        aria-label={intl.formatMessage({ id: "ariaLabel.footer" })}
                        gap={3}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <CoordinateViewer precision={2} />
                        <ScaleBar />
                        <ScaleViewer />
                    </Flex>
                </DefaultMapProvider>
            </TitledSection>
        </Flex>
    );
}

function BasemapSwitcherComponent() {
    const intl = useIntl();
    const labelId = useId();
    return (
        <VStack align="start" mt={2} gap={1}>
            <Text id={labelId} as="b" mb={1}>
                {intl.formatMessage({ id: "basemapLabel" })}
            </Text>
            <BasemapSwitcher aria-labelledby={labelId} allowSelectingEmptyBasemap />
        </VStack>
    );
}
