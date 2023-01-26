import { createCustomElement } from "@open-pioneer/runtime";
import styles from "./app.css?inline";
import { MapApp } from "./MapApp";

const element = createCustomElement({
    component: MapApp,
    styles
});

customElements.define("ol-map-app", element);
