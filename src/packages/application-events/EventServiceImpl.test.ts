/**
 * @vitest-environment jsdom
 */
import { createService } from "@open-pioneer/test-utils/services";
import { expect, it } from "vitest";
import { EventServiceImpl } from "./EventServiceImpl";

it("emits events on the application's host element", async () => {
    const eventName = "my-custom-event";

    const events: string[] = [];
    const div = document.createElement("div");
    div.addEventListener(eventName, (e) => {
        events.push(e.type);
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
    eventService.emitEvent(eventName);
    expect(events).toEqual([eventName]);
});
