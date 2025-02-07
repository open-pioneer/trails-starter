// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { createCustomElement } from "@open-pioneer/runtime";
import { theme as baseTheme } from "@open-pioneer/theme";
import * as appMetadata from "open-pioneer:app";
import { MapApp } from "./MapApp";
import { extendTheme } from "@open-pioneer/chakra-integration";

const theme = extendTheme(
    {
        components: {
            // See https://github.com/chakra-ui/chakra-ui/issues/2893#issuecomment-1540895564
            // Drawer variant to allow pointer events to the underlying content
            Drawer: {
                variants: {
                    clickThrough: {
                        overlay: {
                            pointerEvents: "none",
                            background: "transparent"
                        },
                        dialogContainer: {
                            pointerEvents: "none",
                            background: "transparent"
                        },
                        dialog: {
                            pointerEvents: "auto"
                        }
                    }
                }
            }
        }
    },
    baseTheme
);

const element = createCustomElement({
    component: MapApp,
    theme,
    appMetadata
});

customElements.define("ol-map-app", element);
