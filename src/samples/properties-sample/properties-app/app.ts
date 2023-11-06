// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApplicationProperties, createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI";

const element = createCustomElement({
    component: AppUI,
    appMetadata,
    async resolveConfig(ctx) {
        const customLevel = ctx.getAttribute("level");
        if (!customLevel) {
            return undefined;
        }

        const properties: ApplicationProperties = {
            "properties-app": {
                notifierLevel: customLevel
            }
        };
        return { properties };
    }
});

customElements.define("properties-app", element);
