import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    services: {
        EventServiceImpl: {
            provides: "application-events.EventService",
            references: {
                ctx: "runtime.ApplicationContext"
            }
        }
    }
});
