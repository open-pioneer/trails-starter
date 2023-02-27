// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { EventEmitter, Resource } from "@open-pioneer/core";

export interface ObservableBox<T> {
    /** The current value. */
    readonly value: T;

    /**
     * Changes the current value.
     *
     * Note that this function is only present during development to facilitate hot reloading.
     */
    setValue?(value: T): void;

    /**
     * Register a listener callback that will be invoked
     * when the value changes.
     *
     * Note that this function is only present during development to facilitate hot reloading.
     */
    on?(event: "changed", listener: () => void): Resource;
}

/**
 * Returns a boxed value.
 * In development node, the box value can be changed and observed.
 */
export function createBox<T>(value: T): ObservableBox<T> {
    if (import.meta.env.DEV) {
        return new BoxImpl(value);
    } else {
        return {
            value
        };
    }
}

class BoxImpl<T> extends EventEmitter<{ changed: void }> implements Required<ObservableBox<T>> {
    value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    setValue(value: T): void {
        this.value = value;
        this.emit("changed");
    }
}
