export default {
    styles: "./app.css",
    services: {
        Provider: {
            provides: ["config.MapConfig"]
        }
    },
    ui: {
        references: ["config.MapConfig", "logging.LogService"]
    }
};
