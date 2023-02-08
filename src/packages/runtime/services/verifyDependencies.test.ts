import { assert, expect, it } from "vitest";
import { expectError } from "../test-utils/expectError";
import { InterfaceSpec, ReferenceSpec } from "./InterfaceSpec";
import { ReadonlyServiceLookup } from "./ServiceLookup";
import { ServiceDependency, ServiceRepr } from "./ServiceRepr";
import { verifyDependencies } from "./verifyDependencies";

it("does not return an error on acyclic graphs", function () {
    const services = mockServices([
        {
            name: "Map",
            package: "map",
            provides: ["services.Map"],
            requires: []
        },
        {
            name: "ExampleTool",
            package: "tools",
            provides: [],
            requires: ["services.Map"]
        }
    ]);

    const { serviceLookup, serviceDependencies: computedDependencies } = verifyDependencies({
        services: services
    });
    assert.strictEqual(serviceLookup.serviceCount, 1);

    const service = getService(serviceLookup, "services.Map");
    assert.strictEqual(service.id, "map::Map");

    const mapDependencies = computedDependencies.get("map::Map");
    assert.deepEqual(mapDependencies, {});

    const exampleToolDependencies = computedDependencies.get("tools::ExampleTool")!;
    assert.deepEqual(exampleToolDependencies, {
        dep_0: service
    });
});

it("throws when a service is not implemented", function () {
    const services = mockServices([
        {
            name: "ExampleTool",
            package: "tools",
            provides: [],
            requires: ["services.Map"]
        }
    ]);

    const message = expectError(() =>
        verifyDependencies({
            services: services,
            uiDependencies: []
        })
    ).message;
    expect(message).toMatchSnapshot();
});

it("throws when an interface is implemented multiple times", function () {
    const services = mockServices([
        {
            name: "Map1",
            package: "map",
            provides: ["services.Map"],
            requires: []
        },
        {
            name: "Map2",
            package: "map",
            provides: ["services.Map"],
            requires: []
        }
    ]);

    const message = expectError(() =>
        verifyDependencies({
            services: services,
            uiDependencies: []
        })
    ).message;
    expect(message).toMatchSnapshot();
});

it("allows multiple implementations if the services use a 'qualifier' for disambiguation", function () {
    const services = mockServices([
        {
            name: "Map1",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map1"
                }
            ]
        },
        {
            name: "Map2",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map2"
                }
            ]
        }
    ]);

    const { serviceLookup } = verifyDependencies({
        services: services,
        uiDependencies: []
    });
    assert.strictEqual(serviceLookup.serviceCount, 2);

    const map1 = getService(serviceLookup, "services.Map", "map1");
    assert.strictEqual(map1.id, "map::Map1");

    const map2 = getService(serviceLookup, "services.Map", "map2");
    assert.strictEqual(map2.id, "map::Map2");
});

it("throws for ambiguous service reference", function () {
    const services = mockServices([
        {
            name: "Map1",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map1"
                }
            ]
        },
        {
            name: "Map2",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map2"
                }
            ]
        },
        {
            name: "MapUser",
            package: "map-user",
            requires: [
                {
                    interfaceName: "services.Map"
                }
            ]
        }
    ]);

    const message = expectError(() =>
        verifyDependencies({
            services: services,
            uiDependencies: []
        })
    ).message;
    expect(message).toMatchSnapshot();
});

it("allows to pick an unambiguous implementation via classifier", function () {
    const services = mockServices([
        {
            name: "Map1",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map1"
                }
            ]
        },
        {
            name: "Map2",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map2"
                }
            ]
        },
        {
            name: "MapUser",
            package: "map-user",
            requires: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map2"
                }
            ]
        }
    ]);

    const { serviceLookup, serviceDependencies: computedDependencies } = verifyDependencies({
        services: services,
        uiDependencies: []
    });

    const map2 = getService(serviceLookup, "services.Map", "map2");

    const mapUserDependencies = computedDependencies.get("map-user::MapUser");
    assert.deepEqual(mapUserDependencies, {
        dep_0: map2
    });
});

it("allows to pick all implementations", function () {
    const services = mockServices([
        {
            name: "Map1",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map1"
                }
            ]
        },
        {
            name: "Map2",
            package: "map",
            provides: [
                {
                    interfaceName: "services.Map",
                    qualifier: "map2"
                }
            ]
        },
        {
            name: "MapUser",
            package: "map-user",
            requires: [
                {
                    interfaceName: "services.Map",
                    all: true
                }
            ]
        }
    ]);

    const { serviceDependencies, serviceLookup } = verifyDependencies({
        services: services,
        uiDependencies: []
    });

    const all = serviceLookup.lookupAll("services.Map");
    assert.sameMembers(
        all.map((s) => s.id),
        ["map::Map1", "map::Map2"]
    );

    const mapUserDeps = serviceDependencies.get("map-user::MapUser")!.dep_0!;
    assert.isArray(mapUserDeps);
    assert.sameMembers(mapUserDeps as unknown[], all);
});

it("throws when a component directly depends on itself", function () {
    const services = mockServices([
        {
            name: "Map",
            package: "map",
            provides: ["services.Map"],
            requires: ["services.Map"]
        }
    ]);
    const message = expectError(() =>
        verifyDependencies({
            services: services
        })
    ).message;
    expect(message).toMatchSnapshot();
});

it("throws when a component depends on itself via a larger cycle", function () {
    const services = mockServices([
        {
            name: "a",
            package: "A",
            provides: ["A"],
            requires: ["B"]
        },
        {
            name: "b",
            package: "B",
            provides: ["B"],
            requires: ["D", "C"]
        },
        {
            name: "c",
            package: "C",
            provides: ["C"],
            requires: ["D", "D", "A"]
        },
        {
            name: "d",
            package: "D",
            provides: ["D"]
        }
    ]);

    const message = expectError(() =>
        verifyDependencies({
            services: services
        })
    ).message;
    expect(message).toMatchSnapshot();
});

it("does not return an error when the UI requires an existing interface", function () {
    const services = mockServices([
        {
            name: "Map",
            package: "map",
            provides: ["services.Map"]
        }
    ]);

    const { serviceLookup } = verifyDependencies({
        services: services,
        uiDependencies: [
            {
                interfaceName: "services.Map",
                packageName: "foo"
            }
        ]
    });
    assert.strictEqual(serviceLookup.serviceCount, 1);

    const service = getService(serviceLookup, "services.Map");
    assert.strictEqual(service.id, "map::Map");
});

it("throws when the ui requires an interface that is not implemented", function () {
    const services = mockServices([
        {
            name: "Map",
            package: "map",
            provides: ["services.Map"],
            requires: []
        }
    ]);

    const message = expectError(() =>
        verifyDependencies({
            services,
            uiDependencies: [
                {
                    packageName: "foo",
                    interfaceName: "services.Map2"
                }
            ]
        })
    ).message;
    expect(message).toMatchSnapshot();
});

interface ServiceData {
    package: string;
    name: string;
    requires?: (string | ReferenceSpec)[];
    provides?: (string | InterfaceSpec)[];
}

function mockServices(data: ServiceData[]): ServiceRepr[] {
    return data.map<ServiceRepr>((service) => {
        const name = service.name;
        const packageName = service.package;
        const clazz = class MockService {};
        const dependencies = service.requires?.map<ServiceDependency>((spec, index) => {
            return {
                referenceName: `dep_${index}`,
                ...toInterfaceSpec(spec)
            };
        });
        const interfaces = service.provides?.map(toInterfaceSpec);
        return new ServiceRepr({
            name,
            packageName,
            clazz,
            dependencies,
            interfaces
        });
    });
}

function toInterfaceSpec(spec: string | InterfaceSpec): InterfaceSpec {
    if (typeof spec === "string") {
        return { interfaceName: spec };
    }
    return spec;
}

function getService(
    serviceLookup: ReadonlyServiceLookup,
    interfaceName: string,
    qualifier?: string | undefined
) {
    const result = serviceLookup.lookup({ interfaceName, qualifier });
    if (result.type !== "found") {
        throw new Error(`Failed to find interface ${interfaceName} (qualifier: ${qualifier}).`);
    }
    return result.service;
}
