// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { type EventSource } from "@open-pioneer/core";

export type NotificationLevel = "DEBUG" | "INFO" | "ERROR";

export interface Notification {
    message: string;
    level: NotificationLevel;
}

export interface NotifierEvents {
    "show-notification": Notification;
}

export interface Notifier extends EventSource<NotifierEvents> {
    readonly level: NotificationLevel;

    /**
     * Attempts to emit a notification.
     * Notifications with a level lower than the configured level will not be emitted.
     *
     * Emits the "show-notification" event on success.
     */
    notify(message: string, level?: NotificationLevel): void;
}

import "@open-pioneer/runtime";
declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "properties-app.Notifier": Notifier;
    }
}
