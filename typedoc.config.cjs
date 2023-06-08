// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

const documentedPackages = [
    "sample-package"
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
