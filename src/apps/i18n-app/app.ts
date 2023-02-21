import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { I18nUI } from "./I18nUI";

const Element = createCustomElement({
    component: I18nUI,
    appMetadata
});

customElements.define("i18n-app", Element);
