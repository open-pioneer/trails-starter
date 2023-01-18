import React from "react";
import { createCustomElement } from "@open-pioneer/runtime";
import { App } from "./App";

const Element = createCustomElement({
    component: (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    ),
    styles: "div {background-color: red;}"
});

customElements.define("sample-element", Element);
