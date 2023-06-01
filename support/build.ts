// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { build } from "@open-pioneer/build-package";

await build({
    packageDirectory: "src/packages/framework/layout/sidebar",
    validation: {
        requireChangelog: false,
        requireLicense: false
    }
});
