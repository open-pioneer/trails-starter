// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import headers from "eslint-plugin-headers";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import tsParser from "@typescript-eslint/parser";

export default tseslint.config(
    {
        ignores: [
            "**/dist",
            "**/node_modules",
            "**/temp",
            "**/test-data",
            "support/licenses",
            "**/.*"
        ]
    },
    {
        files: ["**/*.{js,ts,jsx,tsx,mjs,mts,cjs,cts}"],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            importPlugin.flatConfigs.typescript,
            jsxA11y.flatConfigs.recommended,
            react.configs.flat.recommended,
            react.configs.flat["jsx-runtime"],
            reactHooks.configs["recommended-latest"],
            eslintConfigPrettier
        ],
        plugins: { "unused-imports": unusedImports, headers },
        languageOptions: {
            parser: tsParser
        },
        settings: {
            react: {
                version: "detect"
            },
            "import/resolver": {
                typescript: true,
                node: true
            }
        },
        rules: {
            quotes: [
                "error",
                "double",
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true
                }
            ],
            semi: ["error", "always"],
            // Enforce license header
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    content:
                        "SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)\n" +
                        "SPDX-License-Identifier: Apache-2.0",
                    style: "line"
                }
            ],
            // Disallow relative import into another package, e.g. `../other-package/foo`
            "import/no-relative-packages": "error",

            // Warn/error for unused imports and variables.
            // Variables can be prefixed with _ to disable the warning when necessary.
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "react/jsx-uses-vars": "error",
            "unused-imports/no-unused-imports": "warn",
            // Todo: needs to be fixed with https://github.com/open-pioneer/trails-openlayers-base-packages/issues/506
            //"@typescript-eslint/no-non-null-assertion": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_"
                }
            ],
            // Allow {} as type
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unused-expressions": [
                "error",
                {
                    allowShortCircuit: true,
                    allowTernary: true
                }
            ],
            "react-hooks/exhaustive-deps": [
                "warn",
                {
                    additionalHooks: "(useReactiveSnapshot|useComputed)"
                }
            ]
        }
    },
    {
        files: ["**/*.test.*"],
        rules: {
            // Allow non-null assertions in test files
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-explicit-any": "off"
        }
    }
);
