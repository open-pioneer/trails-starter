import { assert } from "chai";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runViteBuild, TEMP_DATA, TEST_DATA } from "./utils/testUtils";

describe("multi page support", function () {
    it("should include the root site if configured", async function () {
        const outDir = resolve(TEMP_DATA, "multi-page-root-site");
        const rootDir = resolve(TEST_DATA, "multi-page");

        await runViteBuild({
            outDir,
            rootDir: rootDir,
            pluginOptions: {
                rootSite: true
            }
        });

        const indexHtml = readFileSync(join(outDir, "index.html"), "utf-8");
        assert.include(indexHtml, "<title>Root Site</title>");

        const appExists = existsSync(join(outDir, "app1.js"));
        assert.isFalse(appExists);

        const siteExists = existsSync(join(outDir, "sites/site1/index.html"));
        assert.isFalse(siteExists);
    });

    it("should include app entry points if configured", async function () {
        const outDir = resolve(TEMP_DATA, "multi-page-apps");
        const rootDir = resolve(TEST_DATA, "multi-page");

        await runViteBuild({
            outDir,
            rootDir: rootDir,
            pluginOptions: {
                apps: ["app1", "app2"]
            }
        });

        const app1 = readFileSync(join(outDir, "app1.js"), "utf-8");
        assert.include(app1, "Hello from app1");

        const app2 = readFileSync(join(outDir, "app2.js"), "utf-8");
        assert.include(app2, "Hello from app2");

        const rootSiteExists = existsSync(join(outDir, "index.html"));
        assert.isFalse(rootSiteExists);

        const siteExists = existsSync(join(outDir, "sites/site1/index.html"));
        assert.isFalse(siteExists);
    });

    it("should include additional sites if configured", async function () {
        const outDir = resolve(TEMP_DATA, "multi-page-sites");
        const rootDir = resolve(TEST_DATA, "multi-page");

        await runViteBuild({
            outDir,
            rootDir: rootDir,
            pluginOptions: {
                sites: ["site1", "site2"]
            }
        });

        const rootSiteExists = existsSync(join(outDir, "index.html"));
        assert.isFalse(rootSiteExists, "root site must not exist");

        const appExists = existsSync(join(outDir, "app1.js"));
        assert.isFalse(appExists);

        const site1 = readFileSync(join(outDir, "sites/site1/index.html"), "utf-8");
        assert.include(site1, "<title>Site1</title>");

        const site2 = readFileSync(join(outDir, "sites/site2/index.html"), "utf-8");
        assert.include(site2, "<title>Site2</title>");
    });

    it("should throw an error if no entry points are configured", async function () {
        const outDir = resolve(TEMP_DATA, "multi-page-no-entry-points");
        const rootDir = resolve(TEST_DATA, "multi-page");
        let message = "";
        try {
            await runViteBuild({
                outDir,
                rootDir: rootDir,
                pluginOptions: {}
            });
            throw new Error("expected error");
        } catch (e) {
            if (e instanceof Error) {
                message = e.message;
            }
        }

        assert.strictEqual(
            message,
            "You must configure at least one site or one app in the pioneer plugin options."
        );
    });
});
