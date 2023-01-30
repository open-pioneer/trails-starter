import { createCustomElement } from "@open-pioneer/runtime";
import { packages, styles } from "open-pioneer:app";
import { MapApp } from "./MapApp";

const element = createCustomElement({
    component: MapApp,
    styles: styles,
    packages: packages
});

customElements.define("ol-map-app", element);
