// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import {
    AlertDialog,
    AlertDialogProps,
    Drawer,
    DrawerProps,
    Modal,
    ModalProps,
    Portal,
    PortalProps,
    Tooltip,
    TooltipProps
} from "@chakra-ui/react";
import { ComponentType, createContext, FC, RefObject, useContext } from "react";

const PortalRootContext = createContext<RefObject<HTMLElement | null> | undefined>(undefined);

export const PortalRootProvider = PortalRootContext.Provider;

export const FixedDrawer: ComponentType<DrawerProps> =
    /*@__PURE__*/ withFixedPortalLocation(Drawer);
export const FixedModal: ComponentType<ModalProps> = /*@__PURE__*/ withFixedPortalLocation(Modal);
export const FixedTooltip: ComponentType<TooltipProps> =
    /*@__PURE__*/ withFixedPortalLocation(Tooltip);
export const FixedAlertDialog: ComponentType<AlertDialogProps> =
    /*@__PURE__*/ withFixedPortalLocation(AlertDialog);

export const FixedPortal: FC<PortalProps> = (props: PortalProps) => {
    const portalContainer = usePortalContainer();
    return <Portal containerRef={portalContainer} {...props} />;
};

// Modal, Drawer, etc. use this property to control the portal
interface PortalPropsAttr {
    portalProps?: Pick<PortalProps, "containerRef">;
}

/**
 * Wraps the given component and sets the default value for `portalProps.containerRef`.
 * This ensures that components using the portal are mounted in the passed portal container (i.e. inside the shadow dom)
 * instead of the body (which is the chakra default).
 */
function withFixedPortalLocation<Props extends PortalPropsAttr>(
    WrappedComponent: ComponentType<Props>
): ComponentType<Props> {
    function FixPortalLocation(inputProps: Props) {
        const portalContainer = usePortalContainer();
        const props = { ...inputProps };
        props.portalProps = {
            containerRef: portalContainer,
            ...inputProps.portalProps
        };
        return <WrappedComponent {...props} />;
    }
    FixPortalLocation.displayName = `FixPortalLocation(${getDisplayName(WrappedComponent)})`;
    return FixPortalLocation;
}

function usePortalContainer() {
    const portalContainer = useContext(PortalRootContext);
    if (!portalContainer) {
        throw new Error(
            `Failed to find portal container: chakra-ui integration was not set up correctly.`
        );
    }
    return portalContainer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDisplayName(WrappedComponent: any): string {
    // https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
