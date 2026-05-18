// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { type DECLARE_SERVICE_INTERFACE, ServiceOptions, PackageIntl } from "@open-pioneer/runtime";
import { ReadonlyReactive } from "@conterra/reactivity-core";

export class GreetingService {
    declare [DECLARE_SERVICE_INTERFACE]: "i18n-howto-app.GreetingService";

    private readonly _intl: ReadonlyReactive<PackageIntl>;

    constructor(serviceOptions: ServiceOptions) {
        this._intl = serviceOptions.currentIntl;
    }

    /**
     * Greets the user in the current locale.
     */
    greet(name: string): string {
        return this._intl.value.formatMessage({ id: "greetingService.greeting" }, { name });
    }
}
