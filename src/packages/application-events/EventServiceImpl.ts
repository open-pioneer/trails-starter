import { ApplicationContext, ServiceOptions } from "@open-pioneer/runtime";
import { EventService } from "./api";

interface References {
    ctx: ApplicationContext;
}

export class EventServiceImpl implements EventService {
    #ctx: ApplicationContext;

    constructor({ references }: ServiceOptions<References>) {
        this.#ctx = references.ctx;
    }

    emitEvent(name: string) {
        const element = this.#ctx.getHostElement();
        const event = new CustomEvent(name, {
            bubbles: false,
            cancelable: false,
            detail: {
                prop: "value"
            }
        });
        element.dispatchEvent(event);
    }
}
