# Changelog

## 2024-06-24

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
