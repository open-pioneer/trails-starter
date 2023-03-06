// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * See https://jamiemason.github.io/syncpack/
 */
const VERSIONS = {
    // i18n
    "@formatjs/intl": "^2.6.7",

    // react base
    "react": "^18.2.0",
    "react-dom": "^18.2.0",

    // chakra-ui
    "@chakra-ui/react": "^2.5.1",
    "@emotion/cache": "^11.10.5",
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "framer-motion": "^9.1.7",

    // testing
    "@testing-library/dom": "^8.20.0",
    "@testing-library/react": "^13.4.0",

    // open layers
    "ol": "^7.2.2"
};

/**
 * When a package from `SHARED_VERSIONS` is used, its version must be exactly the
 * one defined in the object above.
 */
const SHARED_VERSIONS = Object.entries(VERSIONS).map(([pkg, version]) => {
    return {
        label: `Pin version of '${pkg}' to ${version}`,
        dependencies: [pkg],
        packages: ["**"],
        pinVersion: version
    };
});

module.exports = {
    indent: "    ",
    versionGroups: SHARED_VERSIONS
};
