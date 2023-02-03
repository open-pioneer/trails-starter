import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    ui: {
        references: ["logging.LogService"]
    },
    properties: {
        initialMessage: "This is the initial message"
    }
});
