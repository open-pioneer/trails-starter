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
                    ],
                    ui: {
                        references: ["foo.ServiceE"]
                    },
                    properties: [
                        {
                            name: "some_property",
                            defaultValue: "default_value",
                            required: true
                        }
                    ]
                },
                entryPointPath: "entryPoint"
            }
        ]);

        //writeFileSync(testDataFile, pkgMetadata, "utf-8");

        const expected = readFileSync(testDataFile, "utf-8").trim();
        assert.equal(pkgMetadata, expected);
    });
});
