import { dirname } from "node:path";
import { Plugin } from "vite";
import { generatePackagesMetadata } from "./metadataGeneration";
import { detectPackagesInApp } from "./packageDetection";

export function codegenPlugin(): Plugin {
    return {
        name: "pioneer:codegen",

        async resolveId(moduleId, importer) {
            if (moduleId === "open-pioneer:app") {
                return "\0" + moduleId + "?" + importer;
            }
        },

        async load(moduleId) {
            if (moduleId.startsWith("\0open-pioneer:app?")) {
                const importer = moduleId.slice("\0open-pioneer:app?".length);
                const foundPackages = await detectPackagesInApp(this, dirname(importer));
                const generatedSourceCode = generatePackagesMetadata(foundPackages);
                return generatedSourceCode;
            }
        }
    };
}
