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
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Element which is shown in the sidebar menu as icon
     */
    icon: ReactElement;
    /**
     * Label in the menu entry
     */
    label: string;
    /**
     * Corresponding content to the sidebar entry
     */
    content: ReactNode;
}

/**
 * Sidebar configuration
 */
export interface SidebarProperties {
    /**
     * Defines if the sidebar initially is expanded
     */
    defaultExpanded?: boolean;
    /**
     * Event which is triggered when the main section is expanded/collapsed.
     */
    expandedChanged?: (expanded: boolean) => void;
    /**
     * Event which is triggered when sidebar width is changed and returns the new width.
     */
    sidebarWidthChanged?: (width: number) => void;
    /**
     * The visible menu entries and their corrensponding content.
     */
    items?: SidebarItem[];
}

const mainSidebarWidthCollapsed = 60;
const mainSidebarWidthExpanded = 180;
const contentSidebarWidth = 300;

export function Sidebar(props: SidebarProperties) {
    const [selectedEntries, { removeAt: removeSelectedEntry, push: pushSelectedEntry }] =
        useList<string>();
    const { defaultExpanded, expandedChanged, sidebarWidthChanged, items } = props;

    const { isOpen: isMainToggled, onToggle: toggleMain } = useDisclosure({
        defaultIsOpen: defaultExpanded,
        onOpen() {
            expandedChanged && expandedChanged(true);
        },
        onClose() {
            expandedChanged && expandedChanged(false);
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
        if (sidebarWidthChanged) {
            let width = mainSidebarWidthCollapsed;
            if (isMainToggled) {
                width = mainSidebarWidthExpanded;
            }
            if (isContentToggled) {
                width += contentSidebarWidth;
            }
            sidebarWidthChanged(width);
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

    const entries = items?.map((item, idx) => {
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

    const content = selectedEntries.map((a) => {
        const match = items?.find((e) => e.id === a);
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
