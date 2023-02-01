import { APP_CSS_QUERY, APP_PACKAGES_QUERY } from "./shared";

/**
 * Generates the main app metadata module.
 * It delegates the actual metadata generation to auxiliary modules.
 */
export function generateAppMetadata(importer: string) {
    /*
        CSS loading: 
        - 'inline' loads the css as a string literal.
        - the suffix (e.g. '.css') at the very end is important to trigger the correct vite plugin!
        - I would like to import css as an url instead (separate file),
          but that currently hinges on https://github.com/vitejs/vite/pull/11084

        - TODO: .scss support (will currently trigger the esbuild plugin and an error because the file contains both .ts and .scss)
    */

    return `
import packages from ${JSON.stringify(`${importer}?${APP_PACKAGES_QUERY}`)};
import styles from ${JSON.stringify(`${importer}?${APP_CSS_QUERY}&inline&lang.css`)};
export {
    packages,
    styles
};
`.trim();
}
