# Changelog

## 2024-06-24

-   Update trails dependencies.

    It appears that recent versions of pnpm will sometimes not update peer dependencies when using `pnpm update` (https://github.com/pnpm/pnpm/issues/8081).
    This mostly seems to affect _indirectly_ required packages which are not explicitly listed in a `package.json` file.

    This may produce errors such as this:

    ```text
    ERR_PNPM_PEER_DEP_ISSUES  Unmet peer dependencies

    src/packages/sample-package
    └─┬ @open-pioneer/runtime 2.1.5
    ├── ✕ unmet peer @open-pioneer/base-theme@^0.3.2: found 0.3.1
    └── ✕ unmet peer @open-pioneer/runtime-react-support@^1.0.2: found 1.0.1
    ```

    As a workaround, you can temporarily (or even permanently) list the packages and their desired version in a `package.json`, and then execute `pnpm update-shared-versions && pnpm install && pnpm dedupe`.

    For example:

    ```jsonc
    // top level package.json
    {
        // ...
        "dependencies": {
            // ...
            "@open-pioneer/base-theme": "^0.3.2",
            "@open-pioneer/runtime-react-support": "^1.0.2",
            "@open-pioneer/react-utils": "^0.2.3",
            "@open-pioneer/http": "^2.1.7"
        }
    }
    ```

-   Update `react` to 18.3.1
-   Update `ol` to 9.2.4

## 2024-06-17

-   Update patch for `react-select`: only use valid values for `aria-activedescendant`.
    This removes a warning in firefox when `aria-activedescendant` was set to an empty string.

## 2024-05-14

-   Update to Vite 5.1 and Vitest 1.6
    -   Major changes in Vitest 1: [Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v1.0.0)
    -   Major changes in Vite 5: [Release Notes](https://vitejs.dev/blog/announcing-vite5)

## 2024-05-10

-   Require pnpm >= 9.0, see [release notes](https://github.com/pnpm/pnpm/releases/tag/v9.0.0).
    This also updates the lockfile to `lockfileVersion: 9.0`
-   Configure `envDir: __dirname` in `vite.config.ts` to load `.env` files from the root of the repository instead of `src`.

## 2024-03-14

-   Update to latest Open Pioneer Trails packages
-   Update to OpenLayers 9
