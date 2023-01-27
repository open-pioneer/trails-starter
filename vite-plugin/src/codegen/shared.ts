const APP_META = /[?&]open-pioneer-app($|&)/;
const APP_PACKAGES = /[?&]open-pioneer-packages($|&)/;
const APP_CSS_RE = /[?&]open-pioneer-styles($|&)/;
const SOURCE_FILE_RE = /^(.*?)(\?|$)/;

export const APP_META_QUERY = "open-pioneer-app";
export const APP_PACKAGES_QUERY = "open-pioneer-packages";
export const APP_CSS_QUERY = "open-pioneer-styles";

export interface VirtualAppModule {
    type: "app-meta" | "app-packages" | "app-css";
    importer: string;
}

export function parseVirtualAppModuleId(moduleId: string): VirtualAppModule | undefined {
    let type: VirtualAppModule["type"];
    if (moduleId.match(APP_META)) {
        type = "app-meta";
    } else if (moduleId.match(APP_PACKAGES)) {
        type = "app-packages";
    } else if (moduleId.match(APP_CSS_RE)) {
        type = "app-css";
    } else {
        return undefined;
    }

    const importer = getSourceFile(moduleId);
    return { type, importer };
}

function getSourceFile(moduleId: string) {
    const sourceFile = moduleId.match(SOURCE_FILE_RE)?.[1];
    if (!sourceFile || moduleId[0] == "\0") {
        throw new Error(`Failed to get actual source file from '${moduleId}'.`);
    }
    return sourceFile;
}
