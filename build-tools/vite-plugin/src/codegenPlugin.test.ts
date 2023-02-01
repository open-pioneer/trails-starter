import { assert } from "chai";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runViteBuild, TEMP_DATA, TEST_DATA } from "./utils/testUtils";

describe("codegen support", function () {
    it("should generate app packages content", async function () {
        const rootDir = resolve(TEST_DATA, "codegen-packages");
        const outDir = resolve(TEMP_DATA, "codegen-packages");

        await runViteBuild({
            outDir,
            rootDir,
            pluginOptions: {
                apps: ["test-app"]
            }
        });

        const testAppJs = readFileSync(join(outDir, "test-app.js"), "utf-8");
        assert.include(testAppJs, "AppService");
        assert.include(testAppJs, 'console.debug("App Service constructed");');
        assert.include(testAppJs, "LogService");
        assert.include(testAppJs, 'console.log("Hello from LogService!!");');
    });

    it("should generate app css content", async function () {
        const rootDir = resolve(TEST_DATA, "codegen-css");
        const outDir = resolve(TEMP_DATA, "codegen-css");

        await runViteBuild({
            outDir,
            rootDir,
            pluginOptions: {
                apps: ["test-app"]
            }
        });

        const testAppJs = readFileSync(join(outDir, "test-app.js"), "utf-8");
        assert.include(testAppJs, ".class-from-app");
        assert.include(testAppJs, ".class-from-style1");
        assert.include(testAppJs, ".class-from-style2");
    });

    it("should generate react hooks module for packages and apps", async function () {
        const rootDir = resolve(TEST_DATA, "codegen-react-hooks");
        const outDir = resolve(TEMP_DATA, "codegen-react-hooks");

        await runViteBuild({
            outDir,
            rootDir,
            pluginOptions: {
                apps: ["test-app"]
            }
        });

        const appJs = readFileSync(join(outDir, "test-app.js"), "utf-8");
        assert.include(appJs, 'useServiceInternal.bind(void 0, "test-app")');
        assert.include(appJs, 'useServiceInternal.bind(void 0, "package1")');
        assert.include(appJs, 'useServiceInternal.bind(void 0, "package2")');

        assert.include(appJs, '"import.from.app"');
        assert.include(appJs, '"import.from.package1"');
        assert.include(appJs, '"import.from.package2"');
    });

    it("should fail if build config is missing", async function () {
        const rootDir = resolve(TEST_DATA, "codegen-build-config-required");
        const outDir = resolve(TEMP_DATA, "codegen-build-config-required");

        const error = await expectError(() =>
            runViteBuild({
                outDir,
                rootDir,
                pluginOptions: {
                    apps: ["test-app"]
                }
            })
        );
        assert.include(error.message, "Expected a build.config.mjs", "test-app");
        assert.include(error.message, "test-package", "test-app");

        const error2 = await expectError(() =>
            runViteBuild({
                outDir,
                rootDir,
                pluginOptions: {
                    apps: ["test-app2"]
                }
            })
        );
        assert.include(error2.message, "Expected a build.config.mjs", "test-app2");
        assert.include(error2.message, "test-app2", "test-app2");
    });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expectError(fn: () => Promise<void>): Promise<any> {
    return new Promise((resolve, reject) => {
        fn().then(() => {
            reject(new Error("unexpected success"));
        }, resolve);
    });
}
