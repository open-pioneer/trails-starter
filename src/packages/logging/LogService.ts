export class LogService {
    constructor() {
        console.log("Log Service being constructed");
    }

    log(msg: string) {
        console.info("Log message: " + msg);
    }
}
