import { Service } from "@open-pioneer/runtime";
import { Action, ActionProvider } from "../api";

export class MultiActionProvider implements Service<ActionProvider> {
    createActions(): Action[] {
        return [
            {
                id: "clear-browser-action",
                text: "Clear browser",
                trigger() {
                    document.body.innerHTML = "";
                }
            },
            {
                id: "refresh-browser-action",
                text: "Refresh browser",
                trigger() {
                    window.location.reload();
                }
            }
        ];
    }
}
