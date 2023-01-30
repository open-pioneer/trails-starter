import { createCustomElement } from "@open-pioneer/runtime";
import * as appData from "open-pioneer:app";
import { LoggingUI } from "./LoggingUI";

const Element = createCustomElement({
    component: LoggingUI,
    ...appData
});

customElements.define("logging-app", Element);
