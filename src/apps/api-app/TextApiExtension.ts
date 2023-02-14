import { ApiExtension, ServiceOptions } from "@open-pioneer/runtime";
import { TextService } from "./TextService";

interface References {
    textService: TextService;
}

export class TextApiExtension implements ApiExtension {
    private textService: TextService;
    constructor(opts: ServiceOptions<References>) {
        console.log("apiextenstion");
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
