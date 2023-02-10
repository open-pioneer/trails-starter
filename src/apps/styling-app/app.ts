import { createCustomElement } from "@open-pioneer/runtime";
import { SampleComponentWithCss } from "test-ui-components";
import * as appMetadata from "open-pioneer:app";

const Element = createCustomElement({
    component: SampleComponentWithCss,
    appMetadata
});

console.log(`CSS:\n\n${appMetadata.styles.value}`);

customElements.define("styling-app", Element);
