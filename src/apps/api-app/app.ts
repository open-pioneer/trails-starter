import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { createElement } from "react";

const Element = createCustomElement({
    component: () => {
        return createElement("div", undefined, "hello");
    },
    appMetadata
});

customElements.define("api-app", Element);
