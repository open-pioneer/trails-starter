// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: ["de", "en"],
    services: {
        GreetingService: {
            provides: ["i18n-howto-app.GreetingService"]
        }
    },
    ui: {
        references: ["i18n-howto-app.GreetingService"]
    }
});
