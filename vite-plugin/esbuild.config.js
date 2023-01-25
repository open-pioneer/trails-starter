/* eslint-disable @typescript-eslint/no-var-requires */

const esbuild = require("esbuild");

const buildOptions = {
    minify: true,
    sourcemap: true,
    tests: false
};

const buildDevOpts = {
    ...buildOptions,
    sourcemap: true,
    tests: true,
    minify: false
};

const watchOpts = {
    ...buildDevOpts,
    watch: true
};

const modes = {
    build: buildOptions,
    buildDev: buildDevOpts,
    watch: watchOpts
};

const mode = process.argv[2];
build(mode).catch((e) => {
    console.error(e);
    process.exit(1);
});

async function build(mode) {
    const options = modes[mode];
    if (!options) {
        throw new Error(`Unknown mode: '${mode}'`);
    }

    const { minify, sourcemap, tests, watch } = options;

    /** @type {import("esbuild").BuildOptions} */
    const esbuildOptions = {
        entryPoints: ["./src/index.ts"],
        bundle: true,
        outdir: "dist",
        minify: minify ?? false,
        sourcemap: sourcemap ?? false,
        target: "node16",
        platform: "node",
        packages: "external",
        logLevel: "info",
        format: "cjs"
    };

    if (tests) {
        esbuildOptions.entryPoints.push("./src/all.test.ts");
    }

    if (watch) {
        const context = await esbuild.context(esbuildOptions);
        await context.watch();
    } else {
        await esbuild.build(esbuildOptions);
    }
}
