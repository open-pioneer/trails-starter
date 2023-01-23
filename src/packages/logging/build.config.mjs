// TODO: defineBuildConfig (see other task for configuration format)
export default {
    services: {
        LogService: {
            provides: [
                {
                    name: "logging.LogService"
                }
            ]
        }
    }
};
