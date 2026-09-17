// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Rolldown } from "vite";

type Plugin = Rolldown.Plugin;

// Matches a trailing `//# sourceMappingURL=<url>` (or `//@ ...`) comment.
const SOURCE_MAP_URL_RE = /\/\/[#@]\s*sourceMappingURL=(\S+)\s*$/m;

// Matches an inline base64 map, e.g. `data:application/json;charset=utf-8;base64,<payload>`.
const BASE64_DATA_URI_RE = /^data:application\/json[^,]*;base64,(.+)$/;

/**
 * Manually loads source maps that are referenced by JavaScript modules in node_modules.
 *
 * For example: `@open-pioneer/runtime/CustomElement.js` contains a source map (`.map`) next to it.
 * When debugging, it should show up as `CustomElement.ts` (the original source file).
 *
 * Due to a limitation of rolldown, these source maps are not transported at this time,
 * making the file show as as its compiled version (`CustomElement.js`).
 *
 * For more details, see https://github.com/rolldown/rolldown/issues/5561.
 */
export function dependencySourcemaps(): Plugin {
    return {
        name: "dependency-sourcemaps",

        load: {
            // Only run on files from node modules
            filter: { id: /[\\/]node_modules[\\/].*\.[cm]?js$/ },
            async handler(moduleId) {
                let code: string;
                try {
                    code = await readFile(moduleId, "utf8");
                } catch (e) {
                    void e;
                    // console.debug(`[dependency-sourcemaps] Failed to find module ${moduleId}:`, e);
                    return;
                }

                const mapRef = SOURCE_MAP_URL_RE.exec(code)?.[1];
                if (!mapRef) {
                    return;
                }

                let map;
                try {
                    map = await loadSourcemap(moduleId, mapRef);
                } catch (e) {
                    // Vite's dependency optimizer runs rolldown with `logLevel: "silent"`, which
                    // swallows `this.warn`. Use `console.warn` so the message is actually rendered.
                    console.warn(
                        `[dependency-sourcemaps] Failed to parse source map for ${moduleId}:`,
                        e
                    );
                }

                if (!map) {
                    return;
                }

                // Only use source maps with inlined sources. Only a few packages do not inline their sources,
                // and these packages trigger nonsensical vite warnings because vite confuses the optimized chunk with the source module
                // when validating sourcemap paths:
                //
                //      Sourcemap for "foo/trails-openlayers-base-packages/node_modules/.vite/deps/globals-D5aHNsrt.js" points to a source file outside its package: "foo/trails-openlayers-base-packages/node_modules/.pnpm/geotiff@3.0.5/node_modules/geotiff/src/globals.js"
                if (
                    !Array.isArray(map.sourcesContent) ||
                    map.sourcesContent.some((c: unknown) => c == null)
                ) {
                    // console.debug(
                    //     `[dependency-sourcemaps] Ignoring source map for ${moduleId} since it contains non-inlined sources`
                    // );
                    return;
                }

                // Drop the comment so rolldown uses the map we return instead.
                return { code: code.replace(SOURCE_MAP_URL_RE, ""), map };
            }
        }
    };
}

async function loadSourcemap(moduleId: string, sourcemapReference: string) {
    if (sourcemapReference.startsWith("data:")) {
        const base64 = BASE64_DATA_URI_RE.exec(sourcemapReference)?.[1];
        if (!base64) {
            // Unsupported inline map (only base64 data URIs are handled).
            return undefined;
        }
        return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    }

    const mapPath = resolve(dirname(moduleId), sourcemapReference);
    let json: string;
    try {
        json = await readFile(mapPath, "utf8");
    } catch (e) {
        void e;
        // No external map next to the module.
        // console.debug(`[dependency-sourcemaps] Source map not found for ${moduleId}:`, e);
        return undefined;
    }
    return JSON.parse(json);
}
