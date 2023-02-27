// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { AlertStatus, useToast } from "@open-pioneer/chakra-integration";
import { useService } from "open-pioneer:react-hooks";
import { useEffect } from "react";
import { NotificationLevel } from "./api";

const STATUS_MAP: Record<NotificationLevel, AlertStatus | undefined> = {
    DEBUG: undefined,
    INFO: "info",
    ERROR: "error"
};

/**
 * Shows a toast when the notifier service emits a notification.
 */
export function NotifierUI() {
    const notifier = useService("properties-app.Notifier");
    const toast = useToast();
    useEffect(() => {
        const handle = notifier.on("show-notification", (n) => {
            toast({
                position: "bottom-right",
                title: n.message,
                isClosable: true,
                status: STATUS_MAP[n.level]
            });
        });
        return () => handle.destroy();
    }, [notifier, toast]);
    return null;
}
