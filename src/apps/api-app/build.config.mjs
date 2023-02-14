import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        TestApiExtension: {
            provides: "runtime.ApiExtension"
        }
    },
    ui: {
        references: ["application-events.EventService"]
    }
});
