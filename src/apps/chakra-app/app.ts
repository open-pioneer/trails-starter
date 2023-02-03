import { createCustomElement } from "@open-pioneer/runtime";
import * as appData from "open-pioneer:app";
import { SampleUI } from "./SampleUI";

const Element = createCustomElement({
    component: SampleUI,
    ...appData
});

customElements.define("chakra-app", Element);
