import { type LogService } from "logging/LogService";
import { Service, ServiceOptions } from "@open-pioneer/runtime";

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "log-user.LogUser": LogUser;
    }
}

interface References {
    logger: LogService;
}

export class LogUser implements Service {
    constructor(options: ServiceOptions<References>) {
        options.references.logger.log("Hello other service!");
    }
}
