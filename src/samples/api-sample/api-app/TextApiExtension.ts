// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
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
                this.logger.info("Changing text to", JSON.stringify(text));
                this.textService.setText(text);
            }
        };
    }
}
