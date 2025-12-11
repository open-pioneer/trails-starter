# Changelog

## 2025-12-10

- Remove the `configDependency` again due to issues with Renovate.
    - The global settings mentioned in the previous entry are applied directly in `pnpm-workspace.yaml`
    - `resolutionMode` has changed from `time-based` to `lowest-direct` due to issues in PNPM
    - NOTE: Some obsolete configuration options have been removed:
      - `autoInstallPeers: true`,  `dedupePeerDependents: true` and `dangerouslyAllowAllBuilds: false` are set by default in PNPM and don't need to be defined explicitly

## 2025-11-28

- Configure the package `@open-pioneer/pnpm-plugin-defaults` as a `configDependency` in `pnpm-workspace.yaml`.
  The package enforces certain global pnpm settings:
    - `resolutionMode: "time-based"` for a more conservative version resolution algorithm
    - `minimumReleaseAge` to only install new package versions after a certain time (3 days at this time). Packages from `@conterra/*` and `@open-pioneer/*` are excluded from this rule.
    - Both options can help against supply chain attacks
    - For a full list of enforced options, see the package's [README](https://www.npmjs.com/package/@open-pioneer/pnpm-plugin-defaults).
    - Obsolete settings were removed from the `pnpm-workspace.yaml`
- Update build tools (patch releases)
- Use `workspace:*` instead of `workspace:^` for local package references as default.
  This ensures that local packages are always referenced with their exact version to avoid potential issues with version mismatches.
  You can still use open version specifiers (e.g. `workspace:^`) if it is more appropriate for your packages, e.g. if they are released independently of each other.

## 2025-11-20

- Update OpenLayers base packages to 1.1.0
- Update core packages to 4.3.0
- Update OpenLayers to 10.7.0
- Update Vitest to v4
    - Migration should be straight forward, see [this PR](https://github.com/open-pioneer/trails-openlayers-base-packages/pull/531/files) for example
    - See also [Migration Guide](https://vitest.dev/guide/migration.html#vitest-4)
- Update Chakra to 3.29.0
- Update PNPM to 10.22.0
- Update various smaller dependencies

## 2025-10-21

- Update OpenLayers base packages to 1.0.0
- Update core packages to 4.2.0
- Update Chakra UI to 3.28.0
- Update React to 19.2.0
- Update PNPM to 10.18.3
- Update ESLint to v9
    - Configuration format has changed (see `eslint.config.mjs`)
    - Switch from `eslint-plugin-header` to `eslint-plugin-headers`
- Update various smaller dependencies
- Update `vite.config.ts`:
    - Update Vite's transpile targets to `"baseline-widely-available"`.
      These are widely available browser versions maintained by vite (at the time of this writing, Chrome 107+, Edge 107+, Firefox 104+, Safari 16+).
      For more details, see [Vite docs](https://vite.dev/config/build-options.html#build-target).
    - Update react plugin's `devTarget` to `es2024`
    - Remove obsolete configuration related to deprecation warnings
- Update patch for `react-select@5.10.2`
- Update `pnpm-workspace.yaml`:
    - Remove obsolete `overrides` for old CVEs.
    - Remove emotion's dependencies `@emotion/babel-plugin` and `@babel/runtime`.
      These aren't actually being used.
      Removing these dependencies removes unnecessary packages from the license report.
    - Pin patched packages (`@ark-ui/react` and `react-select`) to the specific versions that the patch has been implemented for.

## 2025-08-07

- Update OpenLayers to 10.6.1
- Update Chakra to v3.24.2
    - Patch for `@ark-ui/react` needed a slight update
- Update Vite to 7.1.0
- Update Open Pioneer Trails build tools
- Update React to 19.1.1
- Update TypeScript to 5.9.2
- Various other minor updates

## 2025-06-13

- Bump Chakra to v3.21.0
    - The patch for `zag-js` could be removed, since the underlying issue was fixed
    - The patch for `@ark-ui/react` needed a slight update

## 2025-06-06

- Update to Chakra v3
    - A small migration guide was added to the documentation (in `docs/internals/ChakraV3Migration.md`).
- Update Open Pioneer Trails dependencies to latest version.
    - Core packages: 4.0.0 ([Changes](https://github.com/open-pioneer/trails-core-packages/pull/91))
    - OpenLayers base packages: 0.11.0 ([Changes](https://github.com/open-pioneer/trails-openlayers-base-packages/pull/424))
    - Build tools: maintenance release ([Changes](https://github.com/open-pioneer/trails-build-tools/pull/90))
- The `pre-commit` hook now checks whether the `pnpm-lock.yaml` is up-to-date.
  This should prevent developers from accidentally forgetting to run `pnpm install` before committing.
- Remove eslint rules from `.eslintrc` that are better enforced by prettier (indent, linebreak-style).
- Create a separate `.prettierignore` file.
  Previous, the `.eslintignore` file was reused for prettier as well.
  You can either:

    a. Use the same file, but make sure to use `--ignore-path <PATH>` wherever prettier is used, or
    b. Use separate files.

- Run `prettier` on yaml files during commit hooks.

## 2025-04-25

- Update Open Pioneer Trails dependencies to latest version.
    - Core packages: 3.1.0 ([Changes](https://github.com/open-pioneer/trails-openlayers-base-packages/pull/407))
    - OpenLayers base packages: 0.10.0 ([Changes](https://github.com/open-pioneer/trails-core-packages/pull/88))
    - Build tools ([Changes](https://github.com/open-pioneer/trails-build-tools/pull/78))
- Other dependencies:
    - Update OpenLayers to 10.5.0
    - Update React to 19.1.0
    - Minor updates of miscellaneous dependencies
- Update pnpm to version 10.9.0
    - The `package.json` now lists `"packageManager": "pnpm@$version"`, which makes `pnpm` automatically use the correct version.
      `pnpm self-update` will also update the `package.json` for you.
    - All pnpm-related configuration has moved to the `pnpm-workspace.yaml` file (from `.npmrc`, `package.json`).
- Remove obsolete `disabled-package` directory from directory `support`.

## 2025-02-24

- Update Open Pioneer Trails dependencies to latest version.
    - Core packages: 3.0.0 ([Changes](https://github.com/open-pioneer/trails-core-packages/pull/82#issue-2868735924))
    - OpenLayers base packages: 0.9.0 ([Changes](https://github.com/open-pioneer/trails-openlayers-base-packages/pull/382#issue-2730813021))
    - Build tools ([Changes](https://github.com/open-pioneer/trails-build-tools/pull/76#issue-2604552132))
- Update to React 19 ([Migration Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide))
    - `useRef` always requires an argument now (e.g. `useRef(undefined)` to initialize).
    - `JSX.Element` has been removed.
      Use `ReactNode` or `ReactElement` instead (see [Stackoverflow](https://stackoverflow.com/a/58123882)).
      Chakra components (e.g. `IconButton`) need `ReactElement` in props.
    - If you hide react act warnings in your tests, update your helper.
      The message format changed slightly, see [`disableReactActWarnings()`](https://github.com/open-pioneer/trails-openlayers-base-packages/blob/cb94c752b1e30293d23b0b865e51ff56570255f7/src/testing/test-utils/disable-act-warnings.ts#L29).
- Vite 6 ([Migration](https://vite.dev/guide/migration), should be zero or low effort)
- Vitest 3 ([Migration](https://vitest.dev/guide/migration), likewise)
- Other dependencies:
    - FormatJS 3
    - OpenLayers 10.4.0
    - TypeScript 5.7.3
    - Minor updates of miscellaneous dependencies
- Require Node 20 or newer (was: 18).
- Migrate TypeDoc configuration to ESM (`typedoc.config.mjs`).

## 2025-01-22

- Update Vite to version 5.4.14 due to CVE-2025-24010 ([GHSA-vg6x-rcgg-rjx6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6))

## 2024-12-05

- Update Open Pioneer Trails dependencies to latest version.
    - Core packages: 2.4.0 ([Changes](https://github.com/open-pioneer/trails-core-packages/pull/70#issue-2602612673))
    - OpenLayers base packages: 0.8.0 ([Changes](https://github.com/open-pioneer/trails-openlayers-base-packages/pull/370#issue-2610669421))
- Update OpenLayers to version 10.3.0.
- Slightly update patch setup with mocks needed by OpenLayers 10.3.0 (see `src/testing/global-setup.ts`).
- Update `chakra-react-select` to version 5.
- Update patch for chakra-ui's menu component (see patches in `package.json`).
- Remove obsolete chakra patches.
- Remove obsolete reference to `@chakra-ui/system`.
  This dependency seems to be no longer required and may lead to duplicate packages in your dependency tree.

## 2024-11-18

- Add a new script: `pnpm run generate-sbom`.
  The script generates a software bill of materials (SBOM) for the project that includes all production dependencies.
  For more information, see the [relevant section in the Repository Guide](./docs/RepositoryGuide.md#pnpm-run-generate-sbom).

## 2024-10-22

- Replace `peerDependencies` with normal `dependencies` due to limitations of pnpm.
- Use new CLI tool `check-pnpm-duplicates` ([Docs](https://www.npmjs.com/package/@open-pioneer/check-pnpm-duplicates)) to check for duplicate packages.
  The tool will run automatically after every `pnpm install` (see `prepare` script in `package.json`) and can be triggered manually by running `pnpm check-duplicates`.
  The configuration for `check-duplicates` is stored in `support/duplicate-packages.yaml`.
- Update dependencies:
    - OpenLayers base packages to `0.7.0`
    - Trails core packages to `2.3.0`
    - TypeScript to `5.6.3`
    - Minor updates of miscellaneous dependencies
- Update eslint rules after updating typescript-eslint (see `.eslintrc`)
- Hide deprecation warnings for some legacy SASS APIs used in vite (see `vite.config.ts`)

## 2024-11-18

- Add a new script: `pnpm run generate-sbom`.
  The script generates a software bill of materials (SBOM) for the project that includes all production dependencies.
  For more information, see the [relevant section in the Repository Guide](./docs/RepositoryGuide.md#pnpm-run-generate-sbom).

## 2024-09-27

- Migrate to [pnpm catalogs](https://pnpm.io/catalogs) for central dependencies.

    The catalog protocol allows central management of dependency versions from the root project in `pnpm-workspace.yaml`. Example:

    ```yaml
    # pnpm-workspace.yaml
    catalog:
        "@open-pioneer/basemap-switcher": ^0.4.4
    ```

    ```jsonc
    // some-package/package.json
    {
        "dependencies": {
            // uses version from catalog, the version number does not have to be repeated
            "@open-pioneer/basemap-switcher": "catalog:"
        }
    }
    ```

    To migrate your project, you can use the codemod [`$ pnpx codemod pnpm/catalog`](https://codemod.com/registry/pnpm-catalog). It will automatically create the catalog and rewrite your package.json files. Note that it currently does _not_ handle `peerDependencies`, so a manual step is still required.

    We hope that this change will make dependency management much simpler in the long run.
    For more details, visit [pnpm's documentation](https://pnpm.io/catalogs).

- Remove the `syncpack` dependency and the pnpm scripts `update-shared-versions` and `lint-shared-versions`: they are no longer needed since we now use catalogs.

## 2024-08-06

- Update to latest OpenLayers Trails Packages.
  This also adapts to the breaking change in the react-utils package (see [Release notes](https://github.com/open-pioneer/trails-core-packages/releases/tag/%40open-pioneer%2Freact-utils%401.0.0)).

## 2024-07-24

- Improve the commit hooks (`.husky/pre-commit`).
  Commit hooks run during `git commit` to check the code style and run tests.
  Previously, all files within the project were checked for style issues and all unit tests were run.

    With this update, only changed files will be checked (via [lint-staged](https://www.npmjs.com/package/lint-staged)) and only tests affected by changed files will be re-executed (via `vitest --changed`).
    Also, prettier will now format staged files automatically -- it is no longer necessary to run `prettier` manually in most cases.

    This change significantly improves the time it takes to commit a change.
    Unfortunately, TypeScript will still run type checks on the entire code base.

- Update `syncpack`.

## 2024-07-23

- Update the license report script. It can now handle dependency license information returned by pnpm 9.
  See also <https://github.com/open-pioneer/trails-openlayers-base-packages/pull/335>.
- Configure `virtual-store-dir-max-length=60` in `.npmrc`.

    This limits the paths generated by `pnpm` to the given length, which helps on windows where "long" paths can trigger weird errors.
    See also <https://pnpm.io/npmrc#virtual-store-dir-max-length> for more information.

- Update the patch against `react-select`.
- Update development dependencies.

## 2024-07-04

- `tsconfig.json`: Switch to `"moduleResolution": "Bundler"`.
  This is the appropriate resolution mode for TypeScript code when using a bundler such as Vite.

    `"moduleResolution": "Bundler"` fixes some cases where the TypeScript compiler would not find the declarations for certain modern packages
    (e.g. those that only use `exports` in their package.json).

- Update workflow files (some actions were outdated).

## 2024-06-24

- Update trails dependencies.

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

- Update `react` to 18.3.1
- Update `ol` to 9.2.4
- Update test packages:
    - "@testing-library/dom": "^10.2.0",
    - "@testing-library/jest-dom": "^6.4.6",
    - "@testing-library/react": "^16.0.0",

    These versions resolve a deprecation warning with the new versions of react ("Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act` ...").

    They require patching the dependency declarations of `@open-pioneer/test-utils` to get rid of warnings, since there is no new release yet that declares compatibility
    with the new major versions (although they will work in practice):

    ```jsonc
    // package.json
    {
        "pnpm": {
            "peerDependencyRules": {
                "allowedVersions": {
                    "@open-pioneer/test-utils>@testing-library/react": ">= 14.1.2",
                    "@open-pioneer/test-utils>@testing-library/dom": ">= 9.3.3"
                }
            }
        }
    }
    ```

## 2024-06-17

- Update patch for `react-select`: only use valid values for `aria-activedescendant`.
  This removes a warning in firefox when `aria-activedescendant` was set to an empty string.

## 2024-05-14

- Update to Vite 5.1 and Vitest 1.6
    - Major changes in Vitest 1: [Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v1.0.0)
    - Major changes in Vite 5: [Release Notes](https://vitejs.dev/blog/announcing-vite5)

## 2024-05-10

- Require pnpm >= 9.0, see [release notes](https://github.com/pnpm/pnpm/releases/tag/v9.0.0).
  This also updates the lockfile to `lockfileVersion: 9.0`
- Configure `envDir: __dirname` in `vite.config.ts` to load `.env` files from the root of the repository instead of `src`.

## 2024-03-14

- Update to latest Open Pioneer Trails packages
- Update to OpenLayers 9
