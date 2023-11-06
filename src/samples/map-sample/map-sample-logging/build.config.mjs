// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
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
