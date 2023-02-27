// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Service } from "@open-pioneer/runtime";
import { Action, ActionProvider } from "../api";

export class LoggingActionProvider implements Service<ActionProvider> {
    createActions(): Action[] {
        return [
            {
                id: "logging-action",
                text: "Log a message",
                trigger() {
                    console.info("Logging a message!");
                }
            }
        ];
    }
}
