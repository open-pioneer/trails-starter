import { createCustomElement } from "@open-pioneer/runtime";
import * as appData from "open-pioneer:app";
import { ActionsUI } from "./ActionsUI";

const Element = createCustomElement({
    component: ActionsUI,
    ...appData
});

customElements.define("extension-app", Element);
