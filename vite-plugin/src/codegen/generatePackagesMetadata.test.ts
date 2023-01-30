import { assert } from "chai";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TEST_DATA } from "../utils/testUtils";
import { generatePackagesMetadata } from "./generatePackagesMetadata";

describe("generatePackagesMetadata", function () {
    it("should generate package metadata", function () {
        const testDataFile = resolve(TEST_DATA, "codegen-metadata.js");
        const pkgMetadata = generatePackagesMetadata([
            {
                name: "test",
                config: {
                    styles: undefined,
                    services: [
                        {
                            name: "ServiceA",
                            provides: [],
                            references: {}
                        },
                        {
                            name: "ServiceB",
                            provides: [
                                {
                                    name: "ServiceC"
                                }
                            ],
                            references: {
                                asd: {
                                    name: "ServiceD"
                                }
                            }
                        }
                    ]
                },
                entryPointPath: "entryPoint"
            }
        ]);

        const expected = readFileSync(testDataFile, "utf-8");
        assert.equal(pkgMetadata, expected);
    });
});
