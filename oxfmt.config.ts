// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { defineConfig, type OxfmtConfig } from "oxfmt";

export default defineConfig({
    semi: true,
    tabWidth: 4,
    trailingComma: "none",
    singleQuote: false,
    quoteProps: "preserve",
    printWidth: 100,
    sortPackageJson: true,
    sortImports: {
        newlinesBetween: false
    },
    ignorePatterns: [
        "dist",
        "node_modules",
        "temp",
        "test-data",
        "__snapshots",
        "pnpm-lock.yaml",
        "support/licenses",
        "**/chakra-snippets/**/*.tsx"
    ],
    overrides: [
        {
            files: ["**/*.yaml", "**/*.yml"],
            options: {
                tabWidth: 2
            }
        }
    ]
} satisfies OxfmtConfig);
