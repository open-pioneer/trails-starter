import { createCustomElement } from "@open-pioneer/runtime";
import { AppUI } from "./AppUI";

const Element = createCustomElement({
    component: AppUI,
    styles: "div {background-color: red;}"
});

customElements.define("sample-element", Element);
