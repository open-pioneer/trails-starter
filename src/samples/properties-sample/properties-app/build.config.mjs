// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        NotifierImpl: {
            provides: ["properties-app.Notifier"]
        }
    },
    properties: {
        notifierLevel: "INFO"
    },
    ui: {
        references: ["properties-app.Notifier"]
    }
});
