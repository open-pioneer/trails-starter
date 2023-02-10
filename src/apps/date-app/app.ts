import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { DateUI } from "./DateUI";

const Element = createCustomElement({
    component: DateUI,
    attributes: ["date"],
    appMetadata
});

customElements.define("date-app", Element);
