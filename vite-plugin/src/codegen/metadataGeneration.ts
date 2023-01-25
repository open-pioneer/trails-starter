import generate from "@babel/generator";
import template from "@babel/template";
import * as nodes from "@babel/types";
import { PackageInfo } from "../parser/parseAppInfo";
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

export type PackageInfoInput = Pick<PackageInfo, "name" | "config" | "entryPointPath">;

/**
 * Generates a combined metadata structure that is essentially a Record<string, metadata.PackageMetadata>.
 * The object contents must match the shape required by the runtime (declared in runtime/metadata/index.ts).
 */
export function generatePackagesMetadata(packages: PackageInfoInput[]): string {
    const idGenerator = new IdGenerator();
    const packagesMetadata = nodes.objectExpression([]);
    const imports: nodes.Statement[] = [];
    for (const pkg of packages) {
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

    const program = nodes.program([
        ...imports,
        nodes.exportDefaultDeclaration(packagesMetadata)
    ]);
    return generate(program).code;
}

function generatePackageMetadata(
    pkg: PackageInfoInput,
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
