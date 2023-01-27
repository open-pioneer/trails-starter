declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "logging.LogService": LogService;
    }
}

export class LogService {
    constructor() {
        console.log("Log Service being constructed");
    }

    log(msg: string) {
        console.info("Log message: " + msg);
    }
}
