/**
 * Emits events to users of the current web component.
 */
export interface EventService {
    /**
     * Emits an event to the host site.
     */
    emitEvent(name: string): void;
}

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "application-events.EventService": EventService;
    }
}
