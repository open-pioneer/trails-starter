import { debug } from "debug";

export interface Debugger {
    (msg: string, ...args: unknown[]): void;
}

export function createDebugger(namespace: string): Debugger {
    const logger = debug(namespace);
    return function debugFunction(...args) {
        logger(...args);
    };
}
