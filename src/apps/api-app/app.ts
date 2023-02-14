import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { AppUI } from "./AppUI";

const Element = createCustomElement({
    component: AppUI,
    appMetadata
});

customElements.define("api-app", Element);
