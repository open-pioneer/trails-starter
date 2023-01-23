import { dirname } from "node:path";
import { Plugin } from "vite";
import { createDebugger } from "./debug";
import { generatePackagesMetadata } from "./metadataGeneration";
import { detectPackagesInApp } from "./packageDetection";

const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:codegen-plugin");

export function codegenPlugin(): Plugin {
    return {
        name: "pioneer:codegen",

        // handleHotUpdate(ctx) {
        //     isDebug && debug("hot update: %O", ctx.file);
        // },

        // watchChange(id) {
        //     isDebug && debug("watch change: %O", id);
        // },

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
