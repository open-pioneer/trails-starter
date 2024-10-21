// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { version } from "os";
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

/**
 * additional property that is used to indicate the project's git revision
 * see {@link https://github.com/CycloneDX/cyclonedx-property-taxonomy}
 */
const GIT_REVISION_PROPERTY = "open-pioneer:git_revision";

function main() {
    // Ensure directory exists, then write the report
    mkdirSync(dirname(OUTPUT_JSON_PATH), {
        recursive: true
    });
    const sbom = createSBOM(); // Invoke trivy to generate sbom.
    const projectInfo = readPackageJson(); 
    const gitRevision = getGitRevision();

    //merge additional info into sbom
    enhanceSBOM(sbom, projectInfo, gitRevision);
    //override trivy output with enhanced sbom
    saveSBOMFile(sbom);
}

/**
 * invoke trivy to create sbom for the project
 */
function createSBOM() {
    //execute command to create sbom with trivy
    execSync(`trivy fs --format cyclonedx -o ${OUTPUT_JSON_PATH} .`, { encoding: "utf-8" });
    const sbomJson = JSON.parse(readFileSync(OUTPUT_JSON_PATH, "utf-8"));

    return sbomJson;
}

/**
 * parse additional information from project's package.json
 */
function readPackageJson(): ProjectInfo {
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));

    if (!packageJson["name"]) {
        throw new Error("required property `name` is missing");
    } else if (!packageJson["type"]) {
        throw new Error("required property `type` is missing");
    }

    return {
        name: packageJson["name"],
        type: packageJson["type"],
        version: packageJson["version"]
    };
}

/**
 * execute git commant to retrieve git revision
 */
function getGitRevision(): string {
    const revision = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trimEnd(); //use trim to remove trailing \n from stdout
    return revision;
}

/**
 * merge additional properties into sbom object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enhanceSBOM(sbom: any, projectInfo: ProjectInfo, gitRevision: string) {
    const sbomProjectMetadata = sbom["metadata"]["component"];

    //do not use type from package.json because value `module` is not allowed (https://cyclonedx.org/schema/bom-1.6.schema.json definitions->component->properties->type)
    //sbomProjectMetadata["type"] = projectInfo.type;
    sbomProjectMetadata["name"] = projectInfo.name;
    if (projectInfo.version) {
        sbomProjectMetadata["version"] = version;
    }

    const properties = sbomProjectMetadata["properties"]
        ? (sbomProjectMetadata["properties"] as SBOMProperty[])
        : [];
    properties.push({ name: GIT_REVISION_PROPERTY, value: gitRevision });
    sbomProjectMetadata["properties"] = properties;
}

/**
 * override original output file with updated vesion
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveSBOMFile(sbom: any) {
    const sbomJson = JSON.stringify(sbom, undefined, 4);
    writeFileSync(OUTPUT_JSON_PATH, sbomJson, "utf-8");
}

interface ProjectInfo {
    name: string;
    type: string;
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
