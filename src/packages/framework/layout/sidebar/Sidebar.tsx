// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Flex, IconButton, Spacer, useDisclosure } from "@open-pioneer/chakra-integration";
import { ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";

export interface SidebarProperties {
    defaultExpanded?: boolean;
    expandedChanged?: (expanded: boolean) => void;
    sidebarWidthChanged?: (width: number) => void;
    children?: ReactNode;
}

// TODO: use dynamic sizes
const sidebarWidthCollapsed = 150;
const sidebarWidthExpanded = 400;

export function Sidebar(props: SidebarProperties) {
    // const sidebar = useRef<any>(null);
    const { isOpen, onToggle } = useDisclosure({
        defaultIsOpen: props.defaultExpanded,
        onOpen() {
            if (props.sidebarWidthChanged) props.sidebarWidthChanged(sidebarWidthExpanded);
            if (props.expandedChanged) props.expandedChanged(true);
        },
        onClose() {
            if (props.sidebarWidthChanged) props.sidebarWidthChanged(sidebarWidthCollapsed);
            if (props.expandedChanged) props.expandedChanged(false);
        }
    });

    return (
        <Flex
            // ref={sidebar}
            className="sidebar"
            width={!isOpen ? `${sidebarWidthCollapsed}px` : `${sidebarWidthExpanded}px`}
        >
            <Box display="flex" width="100%" flexDirection="column" padding="10px" gap="10px">
                {props.children}
                <Spacer></Spacer>
                <IconButton
                    aria-label="expand/collapse"
                    variant="ghost"
                    icon={!isOpen ? <ArrowRightIcon /> : <ArrowLeftIcon />}
                    onClick={onToggle}
                />
            </Box>
        </Flex>
    );
}
