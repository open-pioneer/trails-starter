// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { Service } from "@open-pioneer/runtime";
import { Action, ActionProvider } from "../api";

export class OpenWindowActionProvider implements Service<ActionProvider> {
    createActions(): Action[] {
        return [
            {
                id: "open-window-action",
                text: "Open window",
                trigger() {
                    window.open("https://www.conterra.de");
                }
            }
        ];
    }
}
