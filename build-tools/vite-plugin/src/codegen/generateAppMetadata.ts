import { APP_CSS_QUERY, APP_PACKAGES_QUERY } from "./shared";

/**
 * Generates the main app metadata module.
 * It delegates the actual metadata generation to auxiliary modules.
 */
export function generateAppMetadata(importer: string, metadataModuleId: string) {
    /*
        CSS loading: 
        - 'inline' loads the css as a string literal.
        - the suffix (e.g. '.css') at the very end is important to trigger the correct vite plugin!
        - I would like to import css as an url instead (separate file),
          but that currently hinges on https://github.com/vitejs/vite/pull/11084

        - TODO: .scss support (will currently trigger the esbuild plugin and an error because the file contains both .ts and .scss)
    */
    const packagesModule = `${importer}?${APP_PACKAGES_QUERY}`;
    const cssModule = `${importer}?${APP_CSS_QUERY}&inline&lang.css`;
    return `
import { createBox } from ${JSON.stringify(metadataModuleId)};
import packages from ${JSON.stringify(packagesModule)};
import stylesString from ${JSON.stringify(cssModule)};

const styles = createBox(stylesString);
if (import.meta.hot) {
    import.meta.hot.accept((mod) => {
        if (packages !== mod.packages) {
            // Cannot handle changes in packages at the moment.
            import.meta.hot.invalidate();
            return;
        }

        styles.setValue(mod.styles.value);
    });
}

export {
    packages,
    styles
};
`.trim();
}
