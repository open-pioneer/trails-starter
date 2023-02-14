/**
 * @vitest-environment jsdom
 */
import { ApplicationContext } from "@open-pioneer/runtime";
import { expect, it } from "vitest";
import { EventServiceImpl } from "./EventServiceImpl";

it("emits events on the application's host element", () => {
    const eventName = "my-custom-event";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: string[] = [];
    const div = document.createElement("div");
    div.addEventListener(eventName, (e) => {
        events.push(e.type);
    });
    const ctx: Partial<ApplicationContext> = {
        getHostElement() {
            return div;
        }
    };
    const eventService = new EventServiceImpl({
        references: {
            ctx: ctx as ApplicationContext
        },
        properties: {}
    });
    eventService.emitEvent(eventName);
    expect(events).toEqual([eventName]);
});
