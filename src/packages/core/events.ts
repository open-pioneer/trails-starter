import { Resource } from "./resources";

const state = Symbol("EventEmitterState");

type EventsBase = Record<string, unknown>;

export type EventNames<Events extends EventsBase> = keyof Events & string;

type ArgType<T> = [T] extends [void] ? [] : [event: T];

type EventType<Events extends EventsBase, Name extends keyof Events> = ArgType<Events[Name]>;

export class EventEmitter<Events extends {}> {
    [state] = new EventEmitterState();

    on<Name extends EventNames<Events>>(
        eventName: Name,
        listener: (...args: EventType<Events, Name>) => void
    ): Resource {
        return this[state].on(eventName, {
            listener: listener as InternalListener
        });
    }

    once<Name extends EventNames<Events>>(
        eventName: Name,
        listener: (...args: EventType<Events, Name>) => void
    ): Resource {
        return this[state].on(eventName, {
            listener: listener as InternalListener,
            once: true
        });
    }

    emit<Name extends EventNames<Events>>(eventName: Name, ...args: EventType<Events, Name>): void {
        this[state].emit(eventName, args[0]);
    }
}

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
