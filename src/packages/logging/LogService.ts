import { Service } from "@open-pioneer/runtime";

export interface Logger {
    log(message: string): void;
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "logging.LogService": Logger;
    }
}

export class LogService implements Service<Logger> {
    constructor() {
        console.debug("Log Service created");
    }

    destroy() {
        console.debug("Log Service destroyed");
    }

    log(msg: string) {
        console.info("LOG: " + msg);
    }
}
