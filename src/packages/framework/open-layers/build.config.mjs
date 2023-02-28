// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        OpenLayersMapService: {
            provides: ["open-layers-map-service"]
        }
    },
    ui: {
        references: ["open-layers-map-service"]
    }
});
