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
