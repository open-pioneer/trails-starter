import { assert } from "chai";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { generatePackagesMetadata } from "../src/codegen/metadataGeneration";
import { runViteBuild } from "./helper";

describe("codegen support", function () {
    it("should generate app content", async function () {
        const outDir = resolve(__dirname, "../../temp/codegen-root-site");

        await runViteBuild({
            outDir,
            rootDir: resolve(__dirname, "../../test-data/codegen"),
            pluginOptions: {
                apps: ["test-app"]
            }
        });

        const tastAppJs = readFileSync(join(outDir, "test-app.js"), "utf-8");
        assert.include(tastAppJs, "LogService");
        assert.include(tastAppJs, "console.log(\"Hello from LogService!!\");");
    });



    it("should generate package metadata", function () {
        const dir = resolve(__dirname, "../../test-data/codegen");
        const pkgMetadata = generatePackagesMetadata([{
            name: "test",
            config: {
                services: {
                    "ServiceA": {
                        provides: [],
                        references: {}
                    },
                    "ServiceB": {
                        provides: [{
                            name: "ServiceC"
                        }],
                        references: {
                            asd: {
                                name: "ServiceD"
                            }
                        }
                    }
                }
            },
            entryPointPath: "entryPoint"
        }]);

        const expected = readFileSync(join(dir, "expectedCodegen.js"), "utf-8");
        assert.equal(pkgMetadata, expected);
    });
});