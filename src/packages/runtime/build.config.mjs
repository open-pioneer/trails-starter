import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        ApiServiceImpl: {
            provides: "runtime.ApiService",
            references: {
                providers: {
                    name: "runtime.ApiExtension",
                    all: true
                }
            }
        }
    }
});
