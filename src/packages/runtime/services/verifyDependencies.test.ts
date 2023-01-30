import { assert, expect, it } from "vitest";
import { Dependency, ServiceRepr } from "./ServiceRepr";
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

    const index = verifyDependencies({ services: services });
    assert.strictEqual(index.size, 1);
    assert.deepEqual(index.get("services.Map")!.id, "map::Map");
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
            provides: ["D"],
            requires: []
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
            provides: ["services.Map"],
            requires: []
        }
    ]);

    const index = verifyDependencies({
        services: services,
        uiDependencies: [
            {
                interfaceName: "services.Map",
                packageName: "foo"
            }
        ]
    });
    assert.strictEqual(index.size, 1);
    assert.deepEqual(index.get("services.Map")!.id, "map::Map");
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
    requires: string[];
    provides: string[];
}

function mockServices(data: ServiceData[]): ServiceRepr[] {
    return data.map<ServiceRepr>((service) => {
        const name = service.name;
        const packageName = service.package;
        const clazz = class MockService {};
        const dependencies = service.requires.map<Dependency>((interfaceName, index) => {
            return {
                referenceName: `dep_${index}`,
                interfaceName: interfaceName
            };
        });
        return new ServiceRepr({
            name,
            packageName,
            clazz,
            dependencies,
            interfaces: service.provides
        });
    });
}

function expectError(impl: () => void) {
    try {
        impl();
        throw new Error("expected error!");
    } catch (e) {
        if (e instanceof Error) {
            return e;
        }
        throw new Error("unexpected error value, not an instance of Error");
    }
}
