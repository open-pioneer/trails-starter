// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    entryPoints: [],
    services: {
        GreeterImpl: {
            provides: "sample-package.Greeter"
        }
    },
    publishConfig: {
        strict: false
    }
});
