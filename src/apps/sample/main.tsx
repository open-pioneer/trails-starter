import { createCustomElement } from "@open-pioneer/runtime";
import React from "react";
import { App } from "./App";

const CustomElementClazz = createCustomElement({
    component: (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    ),
    styles: "div {background-color: red;}",
    openShadowRoot: true
});
customElements.define("sample-element", CustomElementClazz);
