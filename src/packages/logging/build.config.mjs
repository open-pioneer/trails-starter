import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        LogService: {
            provides: [
                {
                    name: "logging.LogService"
                }
            ]
        }
    },
    properties: {
        logLevel: "INFO"
    }
});
