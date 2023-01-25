import generate from "@babel/generator";
import template from "@babel/template";
import * as nodes from "@babel/types";
import { PackageInfo } from "../parser/parseAppInfo";

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

export function generatePackagesMetadata(packages: Pick<PackageInfo, "name" | "config" | "entryPointPath">[]): string {
    const program = nodes.program([]);
    const importLookup = new Map<unknown, string>(); // key: service object instance, value: import variable name

    // Generate one import per service usage.
    let importCount = 0;
    for (const pkg of packages) {
        for (const [name, service] of Object.entries(pkg.config.services)) {
            const importName = "import_" + String(++importCount);
            importLookup.set(service, importName);

            const renderedImporter = SERVICE_IMPORT({
                SERVICE_NAME: nodes.identifier(name),
                IMPORT_NAME: nodes.identifier(importName),
                IMPORT_SOURCE: nodes.stringLiteral(pkg.entryPointPath)
            });
            program.body.push(renderedImporter);
        }
    }

    // Generate a combined metadata structure that is essentially a Record<string, metadata.PackageMetadata>.
    // The object contents must match the shape required by the runtime (declared in runtime/metadata/index.ts).
    const pkgsObject = nodes.objectExpression([]);
    for (const pkg of packages) {
        const servicesObject = nodes.objectExpression([]);
        for (const [name, service] of Object.entries(pkg.config.services)) {
            const importName = importLookup.get(service);
            if (!importName) {
                throw new Error("internal error: no import name for the given service.");
            }

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
        pkgsObject.properties.push(nodes.objectProperty(nodes.stringLiteral(pkg.name), pkgObject));
    }

    // Export the structure
    program.body.push(nodes.exportDefaultDeclaration(pkgsObject));
    return generate(program).code;
}
