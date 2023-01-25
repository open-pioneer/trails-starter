import { type LogService } from "logging/LogService";
import { Service, ServiceOptions } from "@open-pioneer/runtime";

interface References {
    logger: LogService;
}

export class LogUser implements Service {
    constructor(options: ServiceOptions<References>) {
        options.references.logger.log("Hello from log user!");
    }
}
