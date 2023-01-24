// TODO: defineBuildConfig (see other task for configuration format)
export default {
    services: {
        LogUser: {
            references: {
                logger: "logging.LogService"
            }
        }
    }
};
