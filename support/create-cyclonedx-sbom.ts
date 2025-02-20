// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { execFileSync, execSync } from "child_process";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

/**
 * Generates SBOM (software bill of materials) using {@link https://github.com/aquasecurity/trivy Trivy}.
 * The output file adheres to the {@link https://github.com/CycloneDX/specification CycloneDX specification} with JSON encoding.
 *
 * Important:
 * This script relies on Trivy and can only be executed if Trivy is installed globally.
 */

const THIS_DIR = resolve(dirname(fileURLToPath(import.meta.url)));

const PACKAGE_DIR = resolve(THIS_DIR, "..");
const PACKAGE_JSON_PATH = resolve(PACKAGE_DIR, "package.json");
const OUTPUT_JSON_PATH = resolve(PACKAGE_DIR, "dist/sbom.json");
const TEMP_DIR = resolve(PACKAGE_DIR, "node_modules/.temp");

/**
 * Additional property that is used to indicate the project's git revision
 * see {@link https://github.com/CycloneDX/cyclonedx-property-taxonomy}
 */
const GIT_REVISION_PROPERTY = "open-pioneer:git_revision";

function main() {
    // Ensure directory exists, then write the report
    mkdirSync(dirname(OUTPUT_JSON_PATH), { recursive: true });
    mkdirSync(TEMP_DIR, { recursive: true });

    const sbom = createSBOM(); // Invoke trivy to generate sbom.
    const projectInfo = readPackageJson();
    const gitRevision = getGitRevision();

    // Add additional properties
    enhanceSBOM(sbom, projectInfo, gitRevision);

    // Save to disk
    saveSBOMFile(sbom);
}

/**
 * Invoke trivy to create sbom for the project
 */
function createSBOM() {
    const tempSbom = resolve(TEMP_DIR, "trivy-sbom.json");
    execFileSync("trivy", ["fs", "--format", "cyclonedx", "-o", tempSbom, "."], {
        encoding: "utf-8"
    });
    const sbomJson = JSON.parse(readFileSync(tempSbom, "utf-8"));
    return sbomJson;
}

/**
 * Parse additional information from project's package.json
 */
function readPackageJson(): ProjectInfo {
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));

    if (!packageJson["name"]) {
        throw new Error("required property `name` is missing");
    }

    return {
        name: packageJson["name"],
        version: packageJson["version"]
    };
}

/**
 * Execute git command to retrieve git revision
 */
function getGitRevision(): string {
    const revision = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trimEnd(); //use trim to remove trailing \n from stdout
    return revision;
}

/**
 * Merge additional properties into sbom object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enhanceSBOM(sbom: any, projectInfo: ProjectInfo, gitRevision: string) {
    const sbomProjectMetadata = sbom["metadata"]["component"];

    sbomProjectMetadata["name"] = projectInfo.name;
    if (projectInfo.version) {
        sbomProjectMetadata["version"] = projectInfo.version;
    }

    const properties = (sbomProjectMetadata["properties"] ?? []) as SBOMProperty[];
    properties.push({ name: GIT_REVISION_PROPERTY, value: gitRevision });
    sbomProjectMetadata["properties"] = properties;
}

/**
 * Write the final SBOM to the output path.
 */
function saveSBOMFile(sbom: unknown) {
    const sbomJson = JSON.stringify(sbom, undefined, 4);
    writeFileSync(OUTPUT_JSON_PATH, sbomJson, "utf-8");
}

interface ProjectInfo {
    name: string;
    version?: string;
}

/**
 * represents `property` type from CycloneDX specification
 * key value pair that can be used to add information
 */
interface SBOMProperty {
    name: string;
    value: string;
}

try {
    main();
} catch (e) {
    console.error("Fatal error", e);
    process.exit(1);
}
