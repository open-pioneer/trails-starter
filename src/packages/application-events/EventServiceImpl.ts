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

    emitEvent(name: string, detail?: unknown): void;
    emitEvent(event: Event): void;
    emitEvent(nameOrEvent: string | Event, detail: unknown = null) {
        if (nameOrEvent == null) {
            return;
        }

        if (nameOrEvent instanceof Event) {
            this.#dispatch(nameOrEvent);
            return;
        }

        const event = new CustomEvent(nameOrEvent, {
            bubbles: false,
            cancelable: false,
            detail
        });
        this.#dispatch(event);
    }

    #dispatch(event: Event) {
        this.#ctx.getHostElement().dispatchEvent(event);
    }
}
