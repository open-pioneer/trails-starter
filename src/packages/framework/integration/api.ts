import { type ApiExtension, type ApiMethods, type ApiMethod } from "@open-pioneer/runtime";

/**
 * Emits events to users of the current web component.
 *
 * Use the interface `"integration.ExternalEventService"` to obtain an instance of this service.
 */
export interface ExternalEventService {
    /**
     * Emits an event to the host site as a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent).
     *
     * The `detail` value (if any) will be used as the custom event's `detail`.
     *
     * @example
     *
     * ```js
     * // In the application, e.g. in a service
     * eventService.emitEvent("my-event", { message: "Hello World" });
     *
     * // In the host site (node is the application's web component node)
     * node.addEventLister("my-event", (event) => {
     *     console.log(event.detail);
     * })
     * ```
     */
    emitEvent(name: string, detail?: unknown): void;

    /**
     * Events a prepared [DOM event](https://developer.mozilla.org/en-US/docs/Web/API/Event) to the host site.
     *
     * The event will be dispatched on the web component's dom node without being altered by this service.
     *
     * You must take care to set the appropriate event options for your use case if you're using this overload (e.g. `bubbles`).
     *
     * @example
     *
     * ```js
     * // You can use the CustomEvent class or your own subclass of Event
     * eventService.emitEvent(new CustomEvent("my-event", {
     *     detail: "detail-value"
     * }));
     * ```
     */
    emitEvent(event: Event): void;
}

export { ApiExtension, ApiMethod, ApiMethods }; // re-export for consistency

declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "integration.ApiExtension": ApiExtension;
        "integration.ExternalEventService": ExternalEventService;
    }
}
