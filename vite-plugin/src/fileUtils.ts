import * as fs from "node:fs";

export function fileExists(file: string): Promise<boolean> {
    return fs.promises
        .access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
