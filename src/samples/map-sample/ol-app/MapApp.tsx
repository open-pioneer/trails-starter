// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Box,
    chakra,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    Flex,
    HStack,
    Link,
    List,
    ListItem
} from "@open-pioneer/chakra-integration";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import {
    BaseFeature,
    DefaultMapProvider,
    MapAnchor,
    MapContainer,
    MapModel,
    useMapModel
} from "@open-pioneer/map";
import { InitialExtent, ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { NotificationService, Notifier } from "@open-pioneer/notifier";
import { SectionHeading, TitledSection } from "@open-pioneer/react-utils";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { Point, Polygon } from "ol/geom";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { ReactNode, useEffect, useMemo } from "react";
import { Link as WouterLink, Router, useLocation } from "wouter";
import { getFeatureUrl, useCurrentFeatureId, useRouterOptions } from "./routes";
import { MAP_ID } from "./services";

export function MapApp() {
    const intl = useIntl();
    const { map } = useMapModel(MAP_ID);

    const linkIds = ["1", "2", "123", undefined];
    const links = linkIds.map((id) => (
        <WouterLink key={String(id)} href={getFeatureUrl(id)} asChild>
            <Link>{id ? `Select ${id}` : "Reset"}</Link>
        </WouterLink>
    ));

    return (
        <Router {...useRouterOptions()}>
            <Notifier position="top-right" />
            <Flex height="100%" direction="column" overflow="hidden">
                <TitledSection
                    title={
                        <Box
                            role="region"
                            aria-label={intl.formatMessage({ id: "ariaLabel.header" })}
                            textAlign="center"
                            py={1}
                        >
                            <SectionHeading size={"md"}>
                                Open Pioneer Trails - Map with routing
                            </SectionHeading>
                        </Box>
                    }
                >
                    <HStack alignSelf="center" gap={4} my={2}>
                        {links}
                    </HStack>
                    {map && <AppContent map={map} />}
                </TitledSection>
            </Flex>
        </Router>
    );
}

const DRAWER_WIDTH = 400; // pixels

function AppContent(props: { map: MapModel }) {
    const { map } = props;
    const intl = useIntl();
    const [, navigate] = useLocation();
    const drawerContent = useFeatureSelection(map);

    return (
        <DefaultMapProvider map={map}>
            {drawerContent && (
                <Drawer
                    isOpen={true}
                    onClose={() => {
                        navigate(getFeatureUrl(undefined));
                    }}
                    placement="left"
                    variant={"clickThrough"}
                    closeOnOverlayClick={false}
                    closeOnEsc={false}
                    blockScrollOnMount={false}
                >
                    {drawerContent}
                </Drawer>
            )}
            <Flex flex="1" direction="column" position="relative">
                <MapContainer
                    role="main"
                    aria-label={intl.formatMessage({ id: "ariaLabel.map" })}
                    viewPadding={drawerContent ? { left: DRAWER_WIDTH } : undefined}
                >
                    <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                        <Flex
                            role="bottom-right"
                            aria-label={intl.formatMessage({ id: "ariaLabel.bottomRight" })}
                            direction="column"
                            gap={1}
                            padding={1}
                        >
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
    );
}

/**
 * Handles feature selection logic.
 * We can select (at most) one feature at a time via URL state.
 *
 * If the feature is found, it is highlighted in the map and the content for the drawer is returned from this hook.
 * If the feature cannot be found, a notification is emitted (and no drawer content is returned).
 */
function useFeatureSelection(map: MapModel): ReactNode {
    const notifier = useService<NotificationService>("notifier.NotificationService");
    const selectedFeatureId = useCurrentFeatureId();
    const selectedFeature = selectedFeatureId != null ? FEATURES[selectedFeatureId] : undefined;
    const mapIsReady = useReactiveSnapshot(() => !!map.container, [map]);

    // Emit a notification if the feature cannot be found.
    useEffect(() => {
        if (selectedFeatureId && !selectedFeature) {
            notifier.warning(`Feature '${selectedFeatureId}' not found`);
        }
    }, [notifier, selectedFeature, selectedFeatureId]);

    // Highlight the selected feature.
    useEffect(() => {
        if (!selectedFeature || !mapIsReady) {
            return;
        }

        const highlight = map.highlightAndZoom([selectedFeature], {
            viewPadding: {
                bottom: 50,
                left: 50,
                right: 50,
                top: 50
            }
        });
        return () => highlight.destroy();
    }, [map, mapIsReady, selectedFeature]);

    const drawerContent = useMemo(() => {
        if (!selectedFeature) {
            return undefined;
        }

        const title = `Feature ${selectedFeature.id}`;
        const properties = Object.entries(selectedFeature.properties ?? {}).map(([key, value]) => (
            <ListItem key={key}>
                {key}: {String(value)}
            </ListItem>
        ));

        return (
            <DrawerContent maxW={`${DRAWER_WIDTH}px`} background={"whiteAlpha.800"}>
                <DrawerCloseButton />
                <DrawerHeader>{title}</DrawerHeader>

                <DrawerBody>
                    <chakra.strong display="block">Properties:</chakra.strong>
                    {properties.length > 0 ? <List>{properties}</List> : "No properties"}
                </DrawerBody>

                <DrawerFooter></DrawerFooter>
            </DrawerContent>
        );
    }, [selectedFeature]);

    return drawerContent;
}

const FEATURES: Record<string, BaseFeature> = {
    "1": {
        id: "1",
        geometry: new Polygon([
            [
                [851728.251553, 6788384.425292],
                [851518.049725, 6788651.954891],
                [852182.096409, 6788881.265976],
                [851728.251553, 6788384.425292]
            ]
        ]),
        properties: {
            name: "Feature 1",
            description: "This is the first feature",
            area: 100
        }
    },
    "2": {
        id: "2",
        geometry: new Point([852011.307424, 6788511.322702]),
        properties: {
            name: "Feature 2",
            description: "This is the second feature",
            area: 0
        }
    }
};
