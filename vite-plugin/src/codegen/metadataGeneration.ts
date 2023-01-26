import generate from "@babel/generator";
import template from "@babel/template";
import * as nodes from "@babel/types";
import { PackageMetadata } from "../metadata/MetadataRepository";
import { IdGenerator } from "./IdGenerator";

const SERVICE_IMPORT = template.statement(`
    import { %%SERVICE_NAME%% as %%IMPORT_NAME%% } from %%IMPORT_SOURCE%%;
`);

const PKG_OBJECT = template.expression(`
    {
        name: %%PACKAGE_NAME%%,
        services: %%PACKAGE_SERVICES%%
    }
`);

const SERVICE_OBJECT = template.expression(`
    {
        name: %%SERVICE_NAME%%,
        clazz: %%SERVICE_IMPORT%%,
        provides: %%SERVICE_INTERFACES%%,
        references: %%SERVICE_REFERENCES%%
    }
`);

const INTERFACE_OBJECT = template.expression(`
    {
        name: %%INTERFACE_NAME%%
    }
`);

const REFERENCE_OBJECT = template.expression(`
    {
        name: %%INTERFACE_NAME%%
    }
`);

export type PackageMetadataInput = Pick<PackageMetadata, "name" | "config" | "entryPointPath">;

/**
 * Generates a combined metadata structure that is essentially a Record<string, metadata.PackageMetadata>.
 * The object contents must match the shape required by the runtime (declared in runtime/metadata/index.ts).
 */
export function generatePackagesMetadata(packages: PackageMetadataInput[]): string {
    const idGenerator = new IdGenerator();
    const packagesMetadata = nodes.objectExpression([]);
    const imports: nodes.Statement[] = [];
    for (const pkg of packages) {
        if (skipPackage(pkg)) {
            continue;
        }

        const packageMetadata = generatePackageMetadata(pkg, {
            importServiceClass(variableName, className, entryPoint) {
                const id = idGenerator.generate(variableName);
                const renderedImporter = SERVICE_IMPORT({
                    SERVICE_NAME: nodes.identifier(className),
                    IMPORT_NAME: nodes.identifier(id),
                    IMPORT_SOURCE: nodes.stringLiteral(entryPoint)
                });
                imports.push(renderedImporter);
                return id;
            }
        });
        packagesMetadata.properties.push(
            nodes.objectProperty(nodes.stringLiteral(pkg.name), packageMetadata)
        );
    }

    const program = nodes.program([...imports, nodes.exportDefaultDeclaration(packagesMetadata)]);
    return generate(program).code;
}

/**
 * Generates the metadata object for a single package.
 * As a side effect, service imports for required service classes will be emitted through a callback.
 */
function generatePackageMetadata(
    pkg: PackageMetadataInput,
    options: {
        /**
         * Adds an import to the containing module.
         * Returns the actual variable name associated with the service.
         */
        importServiceClass(variableName: string, className: string, entryPoint: string): string;
    }
): nodes.Expression {
    const servicesObject = nodes.objectExpression([]);
    for (const [name, service] of Object.entries(pkg.config.services)) {
        if (!pkg.entryPointPath) {
            throw new Error(
                `Package '${pkg.name}' must have a valid entry point (typically index.ts or index.js).\n` +
                    "The entry point can be configured by setting the 'main' property in the package.json file."
            );
        }

        const importName = options.importServiceClass(
            pkg.name + "_" + name,
            name,
            pkg.entryPointPath
        );
        const serviceObject = SERVICE_OBJECT({
            SERVICE_NAME: nodes.stringLiteral(name),
            SERVICE_IMPORT: nodes.identifier(importName),
            SERVICE_INTERFACES: nodes.arrayExpression(
                service.provides.map((p) =>
                    INTERFACE_OBJECT({
                        INTERFACE_NAME: nodes.stringLiteral(p.name)
                    })
                )
            ),
            SERVICE_REFERENCES: nodes.objectExpression(
                Object.entries(service.references).map(([referenceName, referenceConfig]) =>
                    nodes.objectProperty(
                        nodes.stringLiteral(referenceName),
                        REFERENCE_OBJECT({
                            INTERFACE_NAME: nodes.stringLiteral(referenceConfig.name)
                        })
                    )
                )
            )
        });

        servicesObject.properties.push(
            nodes.objectProperty(nodes.stringLiteral(name), serviceObject)
        );
    }

    const pkgObject = PKG_OBJECT({
        PACKAGE_NAME: nodes.stringLiteral(pkg.name),
        PACKAGE_SERVICES: servicesObject
    });
    return pkgObject;
}

/**
 * Returns true if the package does not contain any relevant metadata.
 */
function skipPackage(pkg: PackageMetadataInput) {
    const config = pkg.config;
    if (hasProperties(config.services)) {
        return false;
    }
    // TODO: CSS, I18N ..
    return true;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasProperties(obj: Record<string, unknown>) {
    for (const key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            return true;
        }
    }
    return false;
}
