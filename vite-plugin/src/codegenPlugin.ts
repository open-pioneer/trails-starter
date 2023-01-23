import { dirname } from "node:path";
import { Plugin } from "vite";
import { createDebugger } from "./debug";
import { generatePackagesMetadata } from "./metadataGeneration";
import { detectPackagesInApp } from "./packageDetection";

const isDebug = !!process.env.DEBUG;
const debug = createDebugger("open-pioneer:codegen");

const PIONEER_PACKAGES_RE = /[?&]pioneer-packages($|&)/;
const SOURCE_FILE_RE = /^(.*?)(\?|$)/;

export function codegenPlugin(): Plugin {
    return {
        name: "pioneer:codegen",

        handleHotUpdate(ctx) {
            isDebug && debug("hot update: %O", ctx.file);
        },

        watchChange(id) {
            isDebug && debug("watch change: %O", id);
        },

        async resolveId(moduleId, importer) {
            if (moduleId === "open-pioneer:app") {
                if (!importer) {
                    this.error("Must be imported from a source file.");
                }

                return importer + "?pioneer-packages";
            }
        },

        async load(moduleId) {
            if (moduleId.match(PIONEER_PACKAGES_RE)) {
                const importer = moduleId.match(SOURCE_FILE_RE)?.[1];
                if (!importer) {
                    throw new Error(`Failed to extract source file from '${moduleId}'.`);
                }

                isDebug && debug(`Generating metadata for app ${importer}`);
                const foundPackages = await detectPackagesInApp(this, dirname(importer));
                const generatedSourceCode = generatePackagesMetadata(foundPackages);
                isDebug && debug("Generated source content: %O", generatedSourceCode);
                return generatedSourceCode;
            }
        }
    };
}
