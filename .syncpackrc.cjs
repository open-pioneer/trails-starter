// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * See https://jamiemason.github.io/syncpack/
 */

// Packages listed here will have their versions enforced
// by the dependencies in the root package.json.
const ROOT_PACKAGE_NAME = require("./package.json").name;
const ENFORCED_BY_ROOT_PACKAGE = [
    "@formatjs/intl",

    // react base
    "react",
    "react-dom",
    "react-use",

    // chakra-ui
    "@chakra-ui/react",
    "@chakra-ui/icons",
    "@chakra-ui/system",
    "@emotion/cache",
    "@emotion/react",
    "@emotion/styled",
    "framer-motion",

    // testing
    "@testing-library/dom",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "@testing-library/user-event",

    // open layers
    "ol",

    // core packages
    "@open-pioneer/core",
    "@open-pioneer/runtime",
    "@open-pioneer/integration",
    "@open-pioneer/test-utils",
    "@open-pioneer/chakra-integration",
]

module.exports = {
    // Indent used in package.json files
    indent: "    ",
    
    // The first entry here forces all packages in the workspace to use the dependency version
    // from the root package.json when the dependency name is listed in `ENFORCED_BY_ROOT_PACKAGE`.
    // See https://jamiemason.github.io/syncpack/config/version-groups for advanced usage of version groups.
    versionGroups: [
        {
            dependencies: ENFORCED_BY_ROOT_PACKAGE,
            packages: ["**"],   // packages where the pinned version is enforced
            snapTo: [ROOT_PACKAGE_NAME] // package that defines the version to use
        }
    ]
};
