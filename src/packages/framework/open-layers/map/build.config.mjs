// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: `./styles.css`,
    services: {
        OlMapRegistry: {
            provides: ["open-layers-map-service"],
            references: {
                providers: {
                    name: "open-layers-map-config.MapConfigProvider",
                    all: true
                }
            }
        }
    },
    ui: {
        references: ["open-layers-map-service"]
    }
});
