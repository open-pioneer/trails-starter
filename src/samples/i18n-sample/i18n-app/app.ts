// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { I18nUI } from "./I18nUI";

const Element = createCustomElement({
    component: I18nUI,
    appMetadata,
    async resolveConfig(ctx) {
        const locale = ctx.getAttribute("forced-locale");
        if (!locale) {
            return undefined;
        }
        return { locale };
    }
});

customElements.define("i18n-app", Element);
