import { EventEmitter } from "./events";
import { expect, it } from "vitest";

it("should support typed events", function () {
    interface Events {
        mouseClicked: { x: number; y: number };
    }

    const emitter = new EventEmitter<Events>();
    const observed: Events["mouseClicked"][] = [];
    emitter.on("mouseClicked", (event) => observed.push(event));
    emitter.emit("mouseClicked", { x: 1, y: 2 });
    expect(observed).toEqual([{ x: 1, y: 2 }]);
});

it("should allow unsubscribing from events", function () {
    interface Events {
        mouseClicked: { x: number; y: number };
    }

    const emitter = new EventEmitter<Events>();
    const observed: Events["mouseClicked"][] = [];
    const handle = emitter.on("mouseClicked", (event) => observed.push(event));
    handle.destroy();

    emitter.emit("mouseClicked", { x: 1, y: 2 });
    expect(observed).toEqual([]);
});

it("should allow unsubscribing during emit", function () {
    interface Events {
        event: void;
    }

    const emitter = new EventEmitter<Events>();

    // Relies on internals (insertion order == iteration order)
    const observed: string[] = [];
    emitter.on("event", () => {
        observed.push("1");
        otherHandle.destroy();
    });
    const otherHandle = emitter.on("event", () => void observed.push("2"));
    emitter.emit("event");

    expect(observed).toEqual(["1"]);
});

it("should allow subscribing during emit", function () {
    interface Events {
        event: void;
    }

    const emitter = new EventEmitter<Events>();
    const observed: string[] = [];
    let registered = false;
    emitter.on("event", () => {
        observed.push("outer");
        if (!registered) {
            registered = true;
            emitter.on("event", () => {
                observed.push("inner");
            });
        }
    });

    emitter.emit("event");
    expect(observed).toEqual(["outer"]); // Not called during initial emit
    observed.splice(0, observed.length);

    emitter.emit("event");
    expect(observed).toEqual(["outer", "inner"]);
});

it("should allow registering a handler that will only be called once", function () {
    interface Events {
        event: void;
    }

    const emitter = new EventEmitter<Events>();
    const observed: string[] = [];
    emitter.once("event", () => observed.push("foo"));
    emitter.emit("event");
    emitter.emit("event");

    expect(observed).toEqual(["foo"]);
});

it("should call a once handler only once, even with nested emits", function () {
    interface Events {
        event: void;
    }

    const emitter = new EventEmitter<Events>();
    const observed: string[] = [];
    let nestedEmit = false;
    emitter.once("event", () => {
        if (!nestedEmit) {
            nestedEmit = true;
            emitter.emit("event");
        }
        observed.push("foo");
    });
    emitter.emit("event");

    expect(observed).toEqual(["foo"]);
});
