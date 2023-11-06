// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ApiExtension } from "@open-pioneer/integration";

export class SecondApiExtension implements ApiExtension {
    async getApiMethods() {
        return {
            // method to test duplicate api methods (! do not comment in and commit)
            /*changeText: (text: string) => {
                console.warn("duplicate changeText method called");
            },*/

            justAnotherApiMethod: () => {
                console.log("justAnotherApiMethod");
            }
        };
    }
}
