// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

const documentedPackages = [
    "framework/chakra-integration",
    "framework/core",
    "framework/integration",
    "framework/layout/sidebar",
    "framework/open-layers/layer-control",
    "framework/open-layers/map",
    "framework/runtime",
    "framework/test-utils",
];

// See https://typedoc.org/options/
module.exports = {
    "name": "Open Pioneer Packages",
    "readme": "none",
    "out": "dist/docs",
    "entryPointStrategy": "packages",
    "entryPoints": documentedPackages.map(p => `src/packages/${p}`),
    "skipErrorChecking": true,
    "validation": {
        "notExported": false,
        "invalidLink": true,
        "notDocumented": true
    }
};
