// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
import * as appMetadata from "open-pioneer:app";
import { DemoUI } from "./DemoUI";

const Element = createCustomElement({
    component: DemoUI,
    appMetadata
});

customElements.define("api-app", Element);
