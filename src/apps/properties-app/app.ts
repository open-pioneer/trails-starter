import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI";

const element = createCustomElement({
    component: AppUI,
    appMetadata,
    async resolveProperties(ctx) {
        const customLevel = ctx.getAttribute("level");
        if (!customLevel) {
            return undefined;
        }

        return {
            "properties-app": {
                notifierLevel: customLevel
            }
        };
    }
});

customElements.define("properties-app", element);
