import { createCustomElement } from "@open-pioneer/runtime";
import { App } from "./App";

const Element = createCustomElement({
    component: <App />,
    styles: "div {background-color: red;}"
});

customElements.define("sample-element", Element);
