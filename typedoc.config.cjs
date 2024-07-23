// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable @typescript-eslint/no-var-requires */
const { sync: fastGlobSync } = require("fast-glob");
const { dirname } = require("path");
const DEFAULT_HIGHLIGHT_LANGS = require("typedoc").OptionDefaults.highlightLanguages;

const documentedPackages = getPackageDirectories().sort();
console.info("Creating documentation for packages:", documentedPackages);

// See https://typedoc.org/options/
module.exports = {
    name: "Trails Packages",
    readme: "none",
    out: "dist/docs",
    entryPointStrategy: "packages",
    entryPoints: documentedPackages,
    skipErrorChecking: true,
    validation: {
        notExported: false,
        invalidLink: true,
        notDocumented: true
    },

    // 'tsx' is in default, but 'jsx' is not..
    highlightLanguages: [...DEFAULT_HIGHLIGHT_LANGS, "jsx"]
};

// Returns a list of package directories to be documented.
// Each directory must contain a package.json file.
function getPackageDirectories() {
    const packageJsonPaths = fastGlobSync("./src/packages/**/package.json", {
        ignore: ["**/dist/**", "**/node_modules/**"],
        followSymbolicLinks: false
    });
    const packageDirectories = packageJsonPaths
        // If you only want to document non-private packages, use a condition like the one below.
        // readFileSync can be imported via node: `const { readFileSync } = require("fs");`
        //
        // .filter((path) => {
        //     const packageJsonContent = JSON.parse(readFileSync(path, "utf-8"));
        //     const isPrivate = !!packageJsonContent.private;
        //     return !isPrivate;
        // })
        .map((path) => dirname(path));
    return packageDirectories;
}
