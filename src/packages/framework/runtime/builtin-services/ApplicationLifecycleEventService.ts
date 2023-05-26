// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

import { createLogger } from "@open-pioneer/core";
import { Error } from "@open-pioneer/core";
import { ServiceOptions } from "../Service";
import { ServiceType } from "../ServiceRegistry";
import { ApplicationLifecycleListener } from "../api";
import { ErrorId } from "../errors";

const LOG = createLogger("runtime:ApplicationLifecycleEventService");

interface References {
    listeners: ServiceType<"runtime.ApplicationLifecycleListener">[];
}

export class ApplicationLifecycleEventService {
    #listeners: [serviceId: string, listener: ApplicationLifecycleListener][];

    constructor(options: ServiceOptions<References>) {
        const listeners = options.references.listeners;
        const listenersMeta = options.referencesMeta.listeners;
        this.#listeners = listeners.map((listener, index) => [
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            listenersMeta[index]!.serviceId,
            listener
        ]);
    }

    /** @internal */
    emitLifecycleEvent(event: "after-start" | "before-stop"): void {
        const methodName = (() => {
            switch (event) {
                case "after-start":
                    return "afterApplicationStart";
                case "before-stop":
                    return "beforeApplicationStop";
                default:
                    throw new Error(ErrorId.INTERNAL, `Invalid event '${event}'`);
            }
        })();
        for (const [serviceId, listener] of this.#listeners) {
            try {
                listener[methodName]?.();
            } catch (e) {
                LOG.error(`Unexpected error from application lifecycle listener ${serviceId}`, e);
            }
        }
    }
}
