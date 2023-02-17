import { ApplicationProperties, createCustomElement } from "@open-pioneer/runtime";
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

        const customProperties: ApplicationProperties = {
            "properties-app": {
                notifierLevel: customLevel
            }
        };
        return customProperties;
    }
});

customElements.define("properties-app", element);
