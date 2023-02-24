import { ServiceOptions } from "@open-pioneer/runtime";
import { ApiExtension } from "@open-pioneer/integration";
import { TextService } from "./TextService";
import { createLogger, Logger } from "@open-pioneer/core";

interface References {
    textService: TextService;
}

export class TextApiExtension implements ApiExtension {
    private textService: TextService;
    private logger: Logger;
    constructor(opts: ServiceOptions<References>) {
        this.textService = opts.references.textService;
        this.logger = createLogger("api-app:TextApiExtension");
    }

    async getApiMethods() {
        return {
            changeText: (text: string) => {
                this.textService.setText(text);
                this.logger.warn("Test message", { testLog: 123, text: text });
            }
        };
    }
}
