import { PackageMetadata } from "../metadata/MetadataRepository";

export type PackageMetadataInput = Pick<PackageMetadata, "cssFilePath">;

/**
 * Generates a css file that imports the css file defined by the packages.
 */
export function generateCombinedCss(packages: PackageMetadataInput[]) {
    const cssImport = (file: string) => `@import ${JSON.stringify(file)};`;
    return packages
        .filter((pkg) => !!pkg.cssFilePath)
        .map((pkg) => cssImport(pkg.cssFilePath!)) // eslint-disable-line @typescript-eslint/no-non-null-assertion
        .join("\n");
}
