/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @vitest-environment jsdom
 */
import { createService } from "@open-pioneer/test-utils/services";
import { expect, it } from "vitest";
import { EventServiceImpl } from "./EventServiceImpl";

it("emits events on the application's host element", async () => {
    const eventName = "my-custom-event";

    const events: [string, unknown][] = [];
    const div = document.createElement("div");
    div.addEventListener(eventName, (e) => {
        events.push([e.type, (e as any).detail]);
    });
    const eventService = await createService(EventServiceImpl, {
        references: {
            ctx: {
                getHostElement() {
                    return div;
                }
            }
        }
    });
    eventService.emitEvent(eventName, { detail: 123 });
    expect(events).toEqual([[eventName, { detail: 123 }]]);
});

it("emits custom instances of Events", async () => {
    class MyEvent extends Event {
        foo = 3;

        constructor(init?: EventInit) {
            super("my-event", init);
        }
    }

    const e1 = new CustomEvent("custom-event");
    const e2 = new MyEvent();

    const events: Event[] = [];
    const div = document.createElement("div");
    div.addEventListener("my-event", (e) => {
        events.push(e);
    });
    div.addEventListener("custom-event", (e) => {
        events.push(e);
    });
    const eventService = await createService(EventServiceImpl, {
        references: {
            ctx: {
                getHostElement() {
                    return div;
                }
            }
        }
    });
    eventService.emitEvent(e1);
    eventService.emitEvent(e2);
    expect(events).toEqual([e1, e2]);
    expect((events[1] as any)!.foo).toBe(3);
});
