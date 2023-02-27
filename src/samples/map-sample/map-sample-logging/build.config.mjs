// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

/** @type {import("./LogService").LoggingProperties} */
const defaultProperties = {
    logLevel: "INFO"
};

export default defineBuildConfig({
    services: {
        LogService: {
            provides: [
                {
                    name: "map-sample-logging.LogService"
                }
            ]
        }
    },

    properties: defaultProperties
});
