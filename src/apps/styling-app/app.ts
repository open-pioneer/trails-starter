import { createCustomElement } from "@open-pioneer/runtime";
import { SampleComponentWithCss } from "test-ui-components";
import { packages, styles } from "open-pioneer:app";

const Element = createCustomElement({
    component: SampleComponentWithCss,
    packages,
    styles
});

console.log(`CSS:\n\n${styles}`);

customElements.define("styling-app", Element);
