import { Plugin } from "vite";
import { codegenPlugin } from "./codegenPlugin";
import { mpaPlugin } from "./mpaPlugin";
import type { PioneerPluginOptions } from "../types";
export { type PioneerPluginOptions };

export function pioneer(options?: PioneerPluginOptions): Plugin[] {
    return [mpaPlugin(options), codegenPlugin()];
}
