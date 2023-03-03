// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { execSync } from "child_process";
import glob from "fast-glob";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import Handlebars from "handlebars";
import { load as loadYaml } from "js-yaml";
import { basename, dirname, resolve } from "path";
import { fileURLToPath } from "url";

/**
 * Generates a license report from the dependencies of this repository.
 * Should be invoked via `pnpm build-license-report` (or manually from the project root).
 *
 * The project name is read from the root `package.json` file.
 *
 * Outputs an html file (TODO: Location).
 */
const THIS_DIR = resolve(dirname(fileURLToPath(import.meta.url)));
const CONFIG_PATH = resolve(THIS_DIR, "license-config.yaml");

const PACKAGE_DIR = resolve(THIS_DIR, "..");
const PACKAGE_JSON_PATH = resolve(PACKAGE_DIR, "package.json");
const OUTPUT_HTML_PATH = resolve(PACKAGE_DIR, "dist/license-report.html");

function main() {
    const config = readLicenseConfig(CONFIG_PATH);
    const projectName = getProjectName();

    // Invoke pnpm to gather dependency information.
    const reportJson = getPnpmLicenseReport();

    // Analyze licenses: find license information, handle configured overrides and print errors.
    const { error, items } = analyzeLicenses(reportJson, config);

    // Ensure directory exists, then write the report
    mkdirSync(dirname(OUTPUT_HTML_PATH), {
        recursive: true
    });
    const reportHtml = generateReportHtml(projectName, items);
    writeFileSync(OUTPUT_HTML_PATH, reportHtml, "utf-8");

    // Signal error if anything went wrong
    process.exit(error ? 1 : 0);
}

function analyzeLicenses(
    reportJson: PnpmLicensesReport,
    config: LicenseConfig
): {
    error: boolean;
    items: LicenseItem[];
} {
    let unknownLicenses = false;
    let disallowedLicenses = false;
    let missingLicenseText = false;

    const usedOverrides = new Set<OverrideLicenseEntry>();
    const getOverrideEntry = (name: string, version: string) => {
        const entry = config.overrideLicenses.find((e) => e.name === name && e.version === version);
        if (entry) {
            usedOverrides.add(entry);
        }
        return entry;
    };

    const reportProjects = Object.values(reportJson).flat();
    const items = reportProjects.map((project, index) => {
        const name = project.name;
        const version = project.version;
        const overrideEntry = getOverrideEntry(name, version);
        const dependencyInfo = `'${name}' (version ${version})`;

        const licenses = overrideEntry?.license ?? project.license;
        const licenseFiles = overrideEntry?.licenseFiles ?? findLicenseFiles(project.path);
        const noticeFiles = overrideEntry?.noticeFiles ?? findNoticeFiles(project.path);

        if (!overrideEntry?.license) {
            if (!licenses || licenses === "Unknown") {
                unknownLicenses = true;
                console.warn(`Failed to detect licenses of dependency ${dependencyInfo}.`);
            } else if (!config.allowedLicenses.includes(licenses)) {
                disallowedLicenses = true;
                console.warn(
                    `License '${licenses}' of dependency ${dependencyInfo} is not allowed by configuration.`
                );
            }
        }

        const readProjectFile = (file: string) => {
            const path = resolve(project.path, file);
            return readFileSync(path, "utf-8");
        };

        const licenseTexts = licenseFiles.map(readProjectFile);
        if (licenseTexts.length === 0) {
            console.warn(
                `Failed to detect license text of dependency ${dependencyInfo} in ${project.path}`
            );
            missingLicenseText = true;
        }

        const noticeTexts = noticeFiles.map(readProjectFile);
        const item: LicenseItem = {
            id: `dep-${index}`,
            name: name,
            version: version,
            license: licenses,
            licenseText: licenseTexts.join("\n\n"),
            noticeText: noticeTexts.join("\n\n")
        };
        return item;
    });

    items.sort((a, b) => {
        return a.name.localeCompare(b.name, "en-US");
    });

    for (const overrideEntry of config.overrideLicenses) {
        if (!usedOverrides.has(overrideEntry)) {
            console.warn(
                `License override for dependency '${overrideEntry.name}' (version ${overrideEntry.version}) was not used, it should either be updated or removed.`
            );
        }
    }

    const error = unknownLicenses || disallowedLicenses || missingLicenseText;
    return {
        error,
        items
    };
}

interface LicenseItem {
    /** Unique id */
    id: string;

    /** Project name */
    name: string;

    /** Project version */
    version: string;

    /** License name(s) */
    license: string;

    /** License text(s) */
    licenseText: string;

    /** Notice text(s) */
    noticeText: string;
}

function generateReportHtml(projectName: string, licenseItems: LicenseItem[]): string {
    return partials.index(
        {
            projectName,
            licenseItems
        },
        {
            partials
        }
    );
}

const partials = {
    "index": Handlebars.compile(`
        <html>
        <head>
            <title>License report for {{projectName}}</title>
            <style>
                body {
                    max-width: 960px;
                    margin: auto;
                }

                .dependencies {
                    list-style: none;
                    margin: 0;
                    margin-top: 1em;
                    padding: 0;
                }
                
                .toggle {
                    color: blue;
                    text-decoration: underline;
                }

                .dependency .header h2 {
                    font-size: 1.25em;
                    margin-top: 0;
                    margin-bottom: 0.5em;
                    padding: 0;
                }

                .dependency .header .title {
                    display: inline-block;
                    cursor: pointer;
                }

                .dependency .content {
                    display: none;

                    margin-bottom: 2em;
                }

                .dependency .content h3 {
                    padding: 0;
                    margin: 0;
                    margin-bottom: 0.5em;
                }
                
                .dependency .content pre {
                    white-space: pre-line;
                    background-color: #eeeeee;
                    border-radius: 5px;
                    padding: 5px;
                }

                .dependency .content-visible {
                    display: block;
                }
            </style>
        </head>
        <body>
            <h1>License report for {{projectName}}</h1>

            <div>
                <a id="show-all" class="toggle" href="#">
                    Show all
                </a>
                | 
                <a id="hide-all" class="toggle" href="#">
                    Hide all
                </a>
            </div>

            <ul class="dependencies">
            {{#each licenseItems}}
                {{> license-item }}
            {{/each}}
            </ul>
            <script>
                const allTargets = [];

                function registerHandlers() {
                    const elements = document.body.querySelectorAll(".dependency .header .title");
                    for (const element of elements) {
                        const target = document.getElementById(element.dataset.target);
                        allTargets.push(target);

                        element.addEventListener("click", (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleTarget(target);
                        });
                    }

                    document.getElementById("show-all").addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleAll(true);
                    });
                    document.getElementById("hide-all").addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleAll(false);
                    });
                }

                function toggleTarget(target, force) {
                    const className = "content-visible";
                    const classList = target.classList;
                    if (force != null) {
                        if (force) {
                            classList.add(className);
                        } else {
                            classList.remove(className);
                        }
                    } else {
                        classList.toggle(className);
                    }
                }

                function toggleAll(show) {
                    for (const target of allTargets) {
                        toggleTarget(target, show);
                    }
                }

                registerHandlers();
            </script>
        </body>
        </html>
    `),
    "license-item": Handlebars.compile(`
        <li class="dependency">
            <div class="header">
                <a class="toggle title" href="#" data-target="{{id}}-content">
                    <h2>{{ name }} {{ version }} (License: {{license}})</h2>
                </a>
            </div>
            <div id="{{id}}-content" class="content">
                <h3>License</h3>
                <pre>{{licenseText}}</pre>
                {{#if noticeText}}
                    <h3>Notice</h3>
                    <pre>{{noticeText}}</pre>
                {{/if}}
            </div>
        </li>
    `)
};

interface PnpmLicensesReport {
    [license: string]: PnpmLicenseProject[];
}

interface PnpmLicenseProject {
    /** Project name */
    name: string;

    /** Project version */
    version: string;

    /** Location on disk */
    path: string;

    /** License (same as group key) in {@link PnpmLicensesReport} */
    license: string;
}

function getPnpmLicenseReport(): PnpmLicensesReport {
    const reportJsonText = execSync("pnpm licenses list --json --long -P", { encoding: "utf-8" });
    const reportJson = JSON.parse(reportJsonText);
    return reportJson;
}

interface LicenseConfig {
    allowedLicenses: string[];
    overrideLicenses: OverrideLicenseEntry[];
}

interface OverrideLicenseEntry {
    /** Project name */
    name: string;

    /** Exact project version */
    version: string;

    /** Manual license name */
    license?: string;

    /** License files, relative to dependency dir */
    licenseFiles?: string[];

    /** Notice files, relative to dependency dir */
    noticeFiles?: string[];
}

function readLicenseConfig(path: string): LicenseConfig {
    try {
        const content = readFileSync(path, "utf-8");
        const data = loadYaml(content);
        return data as LicenseConfig;
    } catch (e) {
        throw new Error(`Failed to read license config from ${path}: ${e}`);
    }
}

const LICENSE_FILES = "LICENSE LICENCE COPYING".split(" ");
const NOTICE_FILES = "NOTICE".split(" ");

/**
 * Attempts to find license files in the given directory.
 * Returns the first file matching one of the file patterns above,
 * without checking the content.
 *
 * For license files, this may currently fall back to the project's readme file.
 *
 * The license output must be checked manually!
 */
function findLicenseFiles(directory: string) {
    return findFirstMatch(directory, LICENSE_FILES);
}

/**
 * Like findLicenseFiles(), but for copyright NOTICE files.
 */
function findNoticeFiles(directory: string) {
    return findFirstMatch(directory, NOTICE_FILES);
}

function findFirstMatch(directory: string, candidates: string[]): string[] {
    // https://github.com/micromatch/micromatch#extended-globbing
    const pattern = "(" + candidates.join("|") + ")";
    const matches = glob.sync(`?(*)${pattern}*`, {
        followSymbolicLinks: false,
        cwd: directory,
        caseSensitiveMatch: false
    });

    for (const candidateName of candidates) {
        for (const matchPath of matches) {
            const matchFileName = basename(matchPath);
            if (matchFileName.toLowerCase().includes(candidateName.toLowerCase())) {
                return [matchPath];
            }
        }
    }
    return [];
}

function getProjectName(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
        data = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    } catch (e) {
        throw new Error(`Failed to read package.json: ${e}`);
    }
    const name = data?.name;
    if (typeof name === "string") {
        return name;
    }
    throw new Error(`Failed to retrieve 'name' from package.json: it must be a string.`);
}

try {
    main();
} catch (e) {
    console.error("Fatal error", e);
    process.exit(1);
}
