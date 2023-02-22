import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: ["de", "en"],
    ui: {
        references: ["runtime.ApplicationContext", "integration.ExternalEventService"]
    }
});
