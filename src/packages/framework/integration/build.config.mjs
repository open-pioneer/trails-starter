// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        ExternalEventServiceImpl: {
            provides: "integration.ExternalEventService",
            references: {
                ctx: "runtime.ApplicationContext"
            }
        }
    }
});
