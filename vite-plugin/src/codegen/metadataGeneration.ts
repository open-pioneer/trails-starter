import generate from "@babel/generator";
import template from "@babel/template";
import * as nodes from "@babel/types";
import { PackageInfo } from "../parseAppInfo";

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

export function generatePackagesMetadata(packages: PackageInfo[]): string {
    const program = nodes.program([]);
    const importLookup = new Map<unknown, string>(); // key: service object instance, value: import variable name

    // Generate one import per service usage.
    let importCount = 0;
    for (const pkg of packages) {
        for (const [name, service] of Object.entries(pkg.metadata.services)) {
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

    // Generate a large metadata structure, essentially a Record<string, metadata.PackageMetadata>
    const pkgsObject = nodes.objectExpression([]);
    for (const pkg of packages) {
        const servicesObject = nodes.objectExpression([]);
        for (const [name, service] of Object.entries(pkg.metadata.services)) {
            const importName = importLookup.get(service);
            if (!importName) {
                throw new Error("internal error: no import name for the given service.");
            }

            const serviceObject = SERVICE_OBJECT({
                SERVICE_NAME: nodes.stringLiteral(name),
                SERVICE_IMPORT: nodes.identifier(importName),
                SERVICE_INTERFACES: nodes.arrayExpression(), // TODO
                SERVICE_REFERENCES: nodes.objectExpression([])
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
