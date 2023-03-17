// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@open-pioneer/chakra-integration";
import { OlComponentConfig } from "@open-pioneer/ol-map";
import { useService } from "open-pioneer:react-hooks";
import { HTMLAttributes } from "react";
import { useAsync } from "react-use";

export function ZoomComponent(props: OlComponentConfig & HTMLAttributes<HTMLDivElement>) {
    const { mapId, ...rest } = props;
    const olMapRegistry = useService("ol-map.MapRegistry");
    const mapState = useAsync(async () => await olMapRegistry.getMap(mapId), [mapId]);
    const duration = 200;

    function zoom(zoomIn: boolean) {
        const view = mapState.value?.getView();
        const currZoom = view?.getZoom();
        if (view && currZoom !== undefined) {
            view.animate({ zoom: currZoom + (zoomIn ? 1 : -1), duration: duration });
        }
    }

    return (
        <Flex direction={"column"} gap="1" {...rest}>
            <IconButton
                size="sm"
                aria-label="zoom in"
                colorScheme="teal"
                variant="solid"
                icon={<AddIcon />}
                onClick={() => zoom(true)}
            />
            <IconButton
                size="sm"
                aria-label="zoom out"
                colorScheme="teal"
                variant="solid"
                icon={<MinusIcon />}
                onClick={() => zoom(false)}
            />
        </Flex>
    );
}
