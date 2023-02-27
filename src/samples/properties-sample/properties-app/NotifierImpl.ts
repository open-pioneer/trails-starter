// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { EventEmitter } from "@open-pioneer/core";
import { ServiceOptions } from "@open-pioneer/runtime";
import { Notifier, NotificationLevel, NotifierEvents } from "./api";

const LEVELS: Record<NotificationLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    ERROR: 2
};

export class NotifierImpl extends EventEmitter<NotifierEvents> implements Notifier {
    readonly level: NotificationLevel;

    constructor(options: ServiceOptions) {
        super();
        this.level = getNotifierLevel(options.properties);
    }

    notify(message: string, level: NotificationLevel | undefined = "INFO"): void {
        if (LEVELS[this.level] > LEVELS[level]) {
            return;
        }
        this.emit("show-notification", {
            level,
            message
        });
    }
}

function getNotifierLevel(properties: Record<string, unknown>) {
    const level = properties.notifierLevel;
    switch (level) {
        case "DEBUG":
        case "INFO":
        case "ERROR":
            return level;
    }
    throw new Error(`Invalid notifier level: '${level}'.`);
}
