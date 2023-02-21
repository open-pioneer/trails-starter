import { expect, it } from "vitest";
import { AppI18n, createEmptyI18n, PackageI18n } from "../I18n";
import { PackageMetadata } from "../metadata";
import { expectError } from "../test-utils/expectError";
import { createPackages, PackageRepr } from "./PackageRepr";

class ClazzA {}

class ClazzB {}

it("parses package metadata into internal package representations", function () {
    const metadata: Record<string, PackageMetadata> = {
        a: {
            name: "a",
            services: {
                A: {
                    name: "A",
                    clazz: ClazzA,
                    provides: [],
                    references: {
                        foo: {
                            name: "b.ServiceB1"
                        }
                    }
                }
            }
        },
        b: {
            name: "b",
            services: {
                B: {
                    name: "B",
                    clazz: ClazzB,
                    provides: [
                        {
                            name: "b.ServiceB1"
                        },
                        {
                            name: "b.ServiceB2"
                        }
                    ],
                    references: {}
                }
            },
            properties: {
                foo: {
                    value: 123,
                    required: false
                }
            }
        }
    };

    const testi18n: AppI18n = {
        locale: "test-locale",
        createPackageI18n() {
            return {
                locale: this.locale,
                formatMessage() {
                    throw new Error("not implemented");
                }
            };
        }
    };

    const packages = createPackages(metadata, testi18n);
    expect(packages).toHaveLength(2);

    const packageA = packages.find((b) => b.name === "a")!;
    expect(packageA).toBeDefined();
    expect(packageA.i18n.locale).toEqual("test-locale");

    const serviceA = packageA.services.find((s) => s.name === "A")!;
    expect(serviceA).toBeDefined();
    expect(serviceA.id).toStrictEqual("a::A");
    expect(serviceA.state).toStrictEqual("not-constructed");
    expect(serviceA.i18n.locale).toEqual("test-locale");
    expect(serviceA.instance).toBeUndefined();
    expect(serviceA.dependencies).toStrictEqual([
        {
            referenceName: "foo",
            interfaceName: "b.ServiceB1",
            qualifier: undefined
        }
    ]);
    expect(serviceA.interfaces).toStrictEqual([]);

    const packageB = packages.find((b) => b.name === "b")!;
    expect(packageB).toBeDefined();
    expect(packageB.i18n.locale).toEqual("test-locale");

    const serviceB = packageB.services.find((s) => s.name === "B")!;
    expect(serviceB).toBeDefined();
    expect(serviceB.interfaces).toStrictEqual([
        { interfaceName: "b.ServiceB1", qualifier: undefined },
        { interfaceName: "b.ServiceB2", qualifier: undefined }
    ]);
    expect(serviceB.properties.foo).toBe(123);
});

it("supports package properties", function () {
    const metadata: PackageMetadata = {
        name: "foo",
        properties: {
            propertyName: {
                value: "propertyValue"
            }
        }
    };
    const pkg = createPackageFromMetadata(metadata);
    expect(pkg.properties).toStrictEqual({
        propertyName: "propertyValue"
    });
});

it("supports package properties in services", function () {
    const metadata: PackageMetadata = {
        name: "foo",
        properties: {
            propertyName: {
                value: "propertyValue"
            }
        },
        services: {
            ServiceA: {
                name: "ServiceA",
                clazz: class {}
            }
        }
    };
    const pkg = createPackageFromMetadata(metadata);
    const service = pkg.services[0]!;
    expect(service).toBeDefined();
    expect(service.properties).toStrictEqual({
        propertyName: "propertyValue"
    });
});

it("supports customization of package properties", function () {
    const metadata: PackageMetadata = {
        name: "foo",
        properties: {
            propertyName: {
                value: "propertyValue"
            }
        }
    };
    const pkg = createPackageFromMetadata(metadata, {
        propertyName: "override"
    });
    expect(pkg.properties).toStrictEqual({
        propertyName: "override"
    });
});

it("throws an error if a required property is not specified", function () {
    const metadata: PackageMetadata = {
        name: "foo",
        properties: {
            propertyName: {
                value: null,
                required: true
            }
        }
    };

    const err = expectError(() => createPackageFromMetadata(metadata));
    expect(err.message).toMatchSnapshot();
});

it("throws no error if a required property is specified", function () {
    const metadata: PackageMetadata = {
        name: "foo",
        properties: {
            propertyName: {
                value: null,
                required: true
            }
        }
    };
    const pkg = createPackageFromMetadata(metadata, {
        propertyName: 123
    });
    expect(pkg).toBeDefined();
});

it("throws an error if an attempt is made to customize a non-existent property", function () {
    const metadata: PackageMetadata = {
        name: "foo",
        properties: {
            propertyName: {
                value: null
            }
        }
    };

    const err = expectError(() =>
        createPackageFromMetadata(metadata, {
            otherProperty: 123
        })
    );
    expect(err.message).toMatchSnapshot();
});

it("passes package properties to created ServiceRepr instances", function () {
    const metadata: PackageMetadata = {
        name: "foo",
        properties: {
            propertyName: {
                value: null
            }
        },
        services: {
            Service: {
                name: "Service",
                clazz: class {}
            }
        }
    };
    const pkg = createPackageFromMetadata(metadata, {
        propertyName: 123
    });
    const service = pkg.services[0]!;
    expect(service.properties).toStrictEqual({
        propertyName: 123
    });
});

function createPackageFromMetadata(
    data: PackageMetadata,
    properties?: Record<string, unknown>,
    i18n?: PackageI18n
) {
    return PackageRepr.create(data, i18n ?? createEmptyI18n(), properties);
}
