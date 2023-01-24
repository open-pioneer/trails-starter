/**
 * Automatically detects the contents of an app and provides the necessary generated data structures
 * to create a web component.
 *
 * This special module can only be imported from an `app.{ts,js,...}` file.
 */
declare module "open-pioneer:app" {
    import { PackageMetadata } from "@open-pioneer/runtime/metadata";

    /**
     * Metadata for packages contained in the app.
     */
    declare const packages: Record<string, PackageMetadata>;
    export default packages;
}
