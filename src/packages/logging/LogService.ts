export class LogService {
    constructor() {
        console.log("Hello from LogService");
    }

    log(msg: string) {
        console.info(msg);
    }
}
