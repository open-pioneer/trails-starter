import { createCustomElement } from "@open-pioneer/runtime";
import { createElement } from "react";
import { AppUI } from "./AppUI";

const Element = createCustomElement({
    component: createElement(AppUI),
    styles: "div {background-color: red;}"
});

customElements.define("sample-element", Element);
