import { createCustomElement } from "@open-pioneer/runtime";
import { createElement } from "react";
import packages from "open-pioneer:app";

const Element = createCustomElement({
    component: () =>
        createElement(
            "span",
            undefined,
            "This app uses two simple services (see browser console output)."
        ),
    packages
});

customElements.define("logging-app", Element);
