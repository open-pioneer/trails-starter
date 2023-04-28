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
    Tooltip,
    useDisclosure
} from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { useCallback } from "react";
import { ReactElement, ReactNode, useEffect, useReducer } from "react";

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

export function Sidebar({
    defaultExpanded,
    expandedChanged,
    sidebarWidthChanged,
    items
}: SidebarProperties) {
    const intl = useIntl();
    const [selectedItems, { toggle: toggleItem }] = useSelection(items);

    // Handles the main section (buttons to open widgets).
    const { isOpen: isMainToggled, onToggle: toggleMain } = useDisclosure({
        defaultIsOpen: defaultExpanded,
        onOpen() {
            expandedChanged?.(true);
        },
        onClose() {
            expandedChanged?.(false);
        }
    });

    // Handles the content section (contents of open widgets).
    const { isOpen: isContentToggled, onToggle: toggleContent } = useDisclosure();
    const hasSelectedItems = selectedItems.size > 0;
    useEffect(() => {
        if (hasSelectedItems && !isContentToggled) {
            toggleContent();
        }
        if (!hasSelectedItems && isContentToggled) {
            toggleContent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasSelectedItems]);

    // Handle sidebar width and propagate changes
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

    // Render one button for every sidebar item.
    const sidebarButtons = items?.map((item, idx) => {
        const color = "white";
        const variant = selectedItems.has(item.id) ? "outline" : "ghost";
        return (
            <div key={idx}>
                {isMainToggled ? (
                    <Button
                        key={item.id}
                        leftIcon={item.icon}
                        variant={variant}
                        colorScheme={color}
                        onClick={() => toggleItem(item)}
                    >
                        {item.label}
                    </Button>
                ) : (
                    <Tooltip key={item.id} hasArrow label={item.label} placement="right">
                        <IconButton
                            aria-label={item.label}
                            variant={variant}
                            colorScheme={color}
                            icon={item.icon}
                            onClick={() => toggleItem(item)}
                        />
                    </Tooltip>
                )}
            </div>
        );
    });

    // Render the content of selected items in the same order as their buttons.
    const content = items
        ?.filter((item) => selectedItems.has(item.id))
        .map((item) => {
            return (
                <div className="content-section" key={item.id}>
                    <Flex className="content-header" alignItems="center">
                        <Box>{item.label}</Box>
                        <Spacer></Spacer>
                        <CloseButton onClick={() => toggleItem(item)} />
                    </Flex>
                    <div className="content-body">{item.content}</div>
                </div>
            );
        });

    const toggleButtonLabel = intl.formatMessage({
        id: isMainToggled ? "toggle.collapse" : "toggle.expand"
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
                {sidebarButtons}
                <Spacer></Spacer>
                <Tooltip label={toggleButtonLabel} hasArrow placement="right">
                    <IconButton
                        aria-label={toggleButtonLabel}
                        variant="ghost"
                        icon={!isMainToggled ? <ArrowRightIcon /> : <ArrowLeftIcon />}
                        onClick={toggleMain}
                    />
                </Tooltip>
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

/**
 * React hook that keeps track of a selection by storing the `id` of selected items.
 */
function useSelection<Item extends { id: string }>(
    items: Item[] | undefined
): [ReadonlySet<string>, { toggle(item: Item): void }] {
    type Action = { type: "toggle"; id: string } | { type: "retain"; ids: string[] };

    const [selected, dispatch] = useReducer(
        (state: Set<string>, action: Action) => {
            switch (action.type) {
                case "toggle": {
                    const newState = new Set(state);
                    if (newState.has(action.id)) {
                        newState.delete(action.id);
                    } else {
                        newState.add(action.id);
                    }
                    return newState;
                }
                case "retain": {
                    const allIds = new Set(action.ids);
                    const newState = new Set(state);
                    for (const id of newState) {
                        if (!allIds.has(id)) {
                            newState.delete(id);
                        }
                    }
                    return newState;
                }
            }
        },
        undefined,
        () => new Set<string>()
    );
    const toggle = useCallback(
        (item: Item) => {
            dispatch({ type: "toggle", id: item.id });
        },
        [dispatch]
    );

    // Reset outdated ids if items change.
    useEffect(() => {
        dispatch({ type: "retain", ids: items?.map((item) => item.id) ?? [] });
    }, [items, dispatch]);

    return [selected, { toggle }];
}
