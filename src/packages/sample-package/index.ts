// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
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
