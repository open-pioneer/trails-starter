import { assert } from "chai";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runViteBuild } from "./helper";

describe("multi page support", function () {
    it("should include the root site if configured", async function () {
        const outDir = resolve(__dirname, "../../temp/multi-page-root-site");

        await runViteBuild({
            outDir,
            rootDir: resolve(__dirname, "../../test-data/multi-page"),
            pluginOptions: {
                rootSite: true
            }
        });

        const indexHtml = readFileSync(join(outDir, "index.html"), "utf-8");
        assert.include(indexHtml, "<title>Root Site</title>");
    });

    it("should include app entry points if configured", async function () {
        const outDir = resolve(__dirname, "../../temp/multi-page-apps");

        await runViteBuild({
            outDir,
            rootDir: resolve(__dirname, "../../test-data/multi-page"),
            pluginOptions: {
                apps: ["app1", "app2"]
            }
        });

        const app1 = readFileSync(join(outDir, "app1.js"), "utf-8");
        assert.include(app1, "Hello from app1");

        const app2 = readFileSync(join(outDir, "app2.js"), "utf-8");
        assert.include(app2, "Hello from app2");
    });

    it("should include additional sites if configured", async function () {
        const outDir = resolve(__dirname, "../../temp/multi-page-sites");

        await runViteBuild({
            outDir,
            rootDir: resolve(__dirname, "../../test-data/multi-page"),
            pluginOptions: {
                sites: ["site1", "site2"]
            }
        });

        const rootSiteExists = existsSync(join(outDir, "index.html"));
        assert.isFalse(rootSiteExists, "root site must not exist");

        const site1 = readFileSync(join(outDir, "sites/site1/index.html"), "utf-8");
        assert.include(site1, "<title>Site1</title>");

        const site2 = readFileSync(join(outDir, "sites/site2/index.html"), "utf-8");
        assert.include(site2, "<title>Site2</title>");
    });

    it("should throw an error if no entry points are configured", async function () {
        const outDir = resolve(__dirname, "../../temp/multi-page-no-entry-points");

        let message = "";
        try {
            await runViteBuild({
                outDir,
                rootDir: resolve(__dirname, "../../test-data/multi-page"),
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

