// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    CloseButton,
    Flex,
    IconButton,
    Spacer,
    useDisclosure
} from "@open-pioneer/chakra-integration";
import { ReactElement, ReactNode, useEffect } from "react";
import { useList } from "react-use";

export interface SidebarItem {
    id: string;
    icon: ReactElement;
    label: string;
    content: ReactNode;
}

export interface SidebarProperties {
    defaultExpanded?: boolean;
    expandedChanged?: (expanded: boolean) => void;
    sidebarWidthChanged?: (width: number) => void;
    items?: SidebarItem[];
    children?: ReactNode;
}

const mainSidebarWidthCollapsed = 60;
const mainSidebarWidthExpanded = 180;
const contentSidebarWidth = 300;

export function Sidebar(props: SidebarProperties) {
    const [selectedEntries, { removeAt: removeSelectedEntry, push: pushSelectedEntry }] =
        useList<string>();

    const { isOpen: isMainToggled, onToggle: toggleMain } = useDisclosure({
        defaultIsOpen: props.defaultExpanded,
        onOpen() {
            if (props.expandedChanged) props.expandedChanged(true);
        },
        onClose() {
            if (props.expandedChanged) props.expandedChanged(false);
        }
    });

    const { isOpen: isContentToggled, onToggle: toggleContent } = useDisclosure();

    // handle toggling of content section
    useEffect(() => {
        if (selectedEntries.length && !isContentToggled) {
            toggleContent();
        }
        if (!selectedEntries.length && isContentToggled) {
            toggleContent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEntries.length]);

    // handle sidebar width and propagate changes
    useEffect(() => {
        if (props.sidebarWidthChanged) {
            let width = mainSidebarWidthCollapsed;
            if (isMainToggled) {
                width = mainSidebarWidthExpanded;
            }
            if (isContentToggled) {
                width += contentSidebarWidth;
            }
            props.sidebarWidthChanged(width);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMainToggled, isContentToggled]);

    const onToggleItem = (item: SidebarItem) => {
        const idx = selectedEntries.findIndex((e) => e === item.id);
        if (idx >= 0) {
            removeSelectedEntry(idx);
        } else {
            pushSelectedEntry(item.id);
        }
    };

    const entries = props.items?.map((item, idx) => {
        const color = "white";
        const variant = selectedEntries.find((e) => e === item.id) ? "outline" : "ghost";
        return (
            <div key={idx}>
                {isMainToggled ? (
                    <Button
                        leftIcon={item.icon}
                        variant={variant}
                        colorScheme={color}
                        onClick={() => onToggleItem(item)}
                    >
                        {item.label}
                    </Button>
                ) : (
                    <IconButton
                        aria-label={item.label}
                        variant={variant}
                        colorScheme={color}
                        icon={item.icon}
                        onClick={() => onToggleItem(item)}
                    />
                )}
            </div>
        );
    });

    const content = Array.from(selectedEntries).map((a) => {
        const match = props.items?.find((e) => e.id === a);
        if (match) {
            return (
                <div className="content-section" key={a}>
                    <Flex className="content-header" alignItems="center">
                        <Box>{match.label}</Box>
                        <Spacer></Spacer>
                        <CloseButton onClick={() => onToggleItem(match)} />
                    </Flex>
                    <div className="content-body">{match.content}</div>
                </div>
            );
        }
    });

    return (
        <Flex className="layout-sidebar">
            <Box
                className="layout-sidebar-main"
                display="flex"
                flexDirection="column"
                width={
                    !isMainToggled
                        ? `${mainSidebarWidthCollapsed}px`
                        : `${mainSidebarWidthExpanded}px`
                }
                padding="10px"
                gap="10px"
            >
                {entries}
                <Spacer></Spacer>
                <IconButton
                    aria-label="expand/collapse"
                    variant="ghost"
                    icon={!isMainToggled ? <ArrowRightIcon /> : <ArrowLeftIcon />}
                    onClick={toggleMain}
                />
            </Box>
            <Box
                className="layout-sidebar-content"
                width={!isContentToggled ? `${0}px` : `${contentSidebarWidth}px`}
            >
                {content}
            </Box>
        </Flex>
    );
}
