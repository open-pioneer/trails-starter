// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
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
