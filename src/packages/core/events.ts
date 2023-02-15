import { Resource } from "./resources";

const state = Symbol("EventEmitterState");

type EventsBase = Record<string, unknown>;

export type EventNames<Events extends EventsBase> = keyof Events & string;

type ArgType<T> = [T] extends [void] ? [] : [event: T];

type EventType<Events extends EventsBase, Name extends keyof Events> = ArgType<Events[Name]>;

/**
 * A support class that implements emitting and listening for events.
 *
 * This class supports inheritance or direct use:
 *
 * ```js
 * const emitter = new EventEmitter();
 * class MyClass extends EventEmitter {};
 * ```
 *
 * When using this class from TypeScript, declare your supported event
 * types using an interface first:
 *
 * ```ts
 * interface Events {
 *      // key: event name, value: event type
 *      "mouse-clicked": MouseEvent;
 * }
 *
 * const emitter = new EventEmitter<Events>();
 * emitter.on("mouse-clicked", (event) => {
 *      // event is a MouseEvent
 * });
 * emitter.emit("mouse-clicked", new MouseEvent(...));
 * ```
 */
export class EventEmitter<Events extends {}> {
    [state] = new EventEmitterState();

    /**
     * Registers the given listener function as an event handler for `eventName`.
     *
     * The listener function should be unregistered by destroying the returned {@link Resource}
     * when it is no longer needed.
     */
    on<Name extends EventNames<Events>>(
        eventName: Name,
        listener: (...args: EventType<Events, Name>) => void
    ): Resource {
        return this[state].on(eventName, {
            listener: listener as InternalListener
        });
    }

    /**
     * Registers the given listener function to listen for `eventName` events _once_.
     * The listener function will automatically be unregistered after it has been called.
     *
     * The listener function should be unregistered by destroying the returned {@link Resource}.
     */
    once<Name extends EventNames<Events>>(
        eventName: Name,
        listener: (...args: EventType<Events, Name>) => void
    ): Resource {
        return this[state].on(eventName, {
            listener: listener as InternalListener,
            once: true
        });
    }

    /**
     * Emits an event of the given name and calls the registered event handlers.
     *
     * _Note:_ event handlers run synchronously.
     * After `emit()` has completed, all listeners will already have been invoked.
     */
    emit<Name extends EventNames<Events>>(eventName: Name, ...args: EventType<Events, Name>): void {
        this[state].emit(eventName, args[0]);
    }
}

/**
 * Read-only version of the {@link EventEmitter} interface that only allows listening for events.
 */
export type EventSource<Events extends {}> = Pick<EventEmitter<Events>, "on" | "once">;

type InternalListener = (event: unknown) => void;

interface EventHandler {
    once?: boolean;
    removed?: boolean;
    listener: InternalListener;
}

class EventEmitterState {
    private handlers = new Map<string, Set<EventHandler>>();

    on(name: string, handler: EventHandler): Resource {
        let handlers = this.handlers.get(name);
        if (!handlers) {
            handlers = new Set();
            this.handlers.set(name, handlers);
        }
        handlers.add(handler);
        return {
            destroy() {
                handler.removed = true;
                handlers?.delete(handler);
                handlers = undefined;
            }
        };
    }

    emit(name: string, event: unknown) {
        const handlers = this.handlers.get(name);
        if (!handlers) {
            return;
        }

        // Copy to allow (de-) registration of handlers during emit.
        // This is convenient for correctness but may been further optimization
        // if events are emitted frequently.
        const copy = [...handlers];
        for (const handler of copy) {
            if (handler.removed) {
                continue;
            }

            if (handler.once) {
                handler.removed = true;
                handlers.delete(handler);
            }
            handler.listener(event);
        }
    }
}
