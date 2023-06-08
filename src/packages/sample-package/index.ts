// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * The greeter produces a greeting message.
 */
export interface Greeter {
    /**
     * Returns a greeting message.
     */
    greet(): string;
}

import "@open-pioneer/runtime";
declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "sample-package.Greeter": Greeter;
    }
}
