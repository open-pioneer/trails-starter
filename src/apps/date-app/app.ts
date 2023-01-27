import { createCustomElement } from "@open-pioneer/runtime";
import { packages } from "open-pioneer:app";
import { DateUI } from "./DateUI";

const Element = createCustomElement({
    component: DateUI,
    attributes: ["date"],
    packages
});

customElements.define("date-app", Element);
