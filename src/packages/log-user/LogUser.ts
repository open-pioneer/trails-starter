import { Service, ServiceOptions, ServiceType } from "@open-pioneer/runtime";

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "log-user.LogUser": LogUser;
    }
}

interface References {
    logger: ServiceType<"logging.LogService">;
}

export class LogUser implements Service {
    constructor(options: ServiceOptions<References>) {
        options.references.logger.log("Hello other service!");
    }
}
