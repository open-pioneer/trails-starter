// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { type DECLARE_SERVICE_INTERFACE, ServiceOptions, PackageIntl } from "@open-pioneer/runtime";

export class GreetingService {
    declare [DECLARE_SERVICE_INTERFACE]: "i18n-howto-app.GreetingService";

    private _intl: PackageIntl;

    constructor(serviceOptions: ServiceOptions) {
        this._intl = serviceOptions.intl;
    }

    /**
     * Greets the user in the current locale.
     */
    greet(name: string): string {
        return this._intl.formatMessage({ id: "greetingService.greeting" }, { name });
    }
}
