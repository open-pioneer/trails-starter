import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: ["de", "en", "de-simple"],
    ui: {
        references: ["runtime.ApplicationContext", "integration.ExternalEventService"]
    }
});
