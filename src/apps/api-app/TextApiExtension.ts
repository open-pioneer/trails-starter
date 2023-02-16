import { ServiceOptions } from "@open-pioneer/runtime";
import { ApiExtension } from "@open-pioneer/integration";
import { TextService } from "./TextService";

interface References {
    textService: TextService;
}

export class TextApiExtension implements ApiExtension {
    private textService: TextService;
    constructor(opts: ServiceOptions<References>) {
        this.textService = opts.references.textService;
    }

    async getApiMethods() {
        return {
            changeText: (text: string) => {
                this.textService.setText(text);
            }
        };
    }
}
