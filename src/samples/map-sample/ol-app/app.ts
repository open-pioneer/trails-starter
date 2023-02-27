// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";

const element = createCustomElement({
    component: MapApp,
    appMetadata
});

customElements.define("ol-map-app", element);
