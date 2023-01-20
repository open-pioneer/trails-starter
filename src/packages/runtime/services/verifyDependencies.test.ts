import { assert, it } from "vitest";
import { Dependency, ServiceRepr } from "./ServiceRepr";
import { verifyDependencies } from "./verifyDependencies";

it("does not return an error on acyclic graphs", function () {
    const components = mockComponents([
        {
            name: "Map",
            bundle: "map",
            provides: ["services.Map"],
            requires: []
        },
        {
            name: "ExampleTool",
            bundle: "tools",
            provides: [],
            requires: ["services.Map"]
        }
    ]);

    const index = verifyDependencies(components);
    assert.strictEqual(index.size, 1);
    assert.deepEqual(index.get("services.Map")!.id, "map::Map");
});

it("throws when a service is not implemented", function () {
    const components = mockComponents([
        {
            name: "ExampleTool",
            bundle: "tools",
            provides: [],
            requires: ["services.Map"]
        }
    ]);
    assert.throws(
        () => verifyDependencies(components),
        "runtime:interface-not-found: Service 'tools::ExampleTool' requires an unimplemented interface 'services.Map' (as dependency 'dep_0')."
    );
});

it("throws when a component directly depends on itself", function () {
    const components = mockComponents([
        {
            name: "Map",
            bundle: "map",
            provides: ["services.Map"],
            requires: ["services.Map"]
        }
    ]);
    assert.throws(
        () => verifyDependencies(components),
        "runtime:dependency-cycle: Detected dependency cycle: 'map::Map' => 'map::Map' ('dep_0' providing 'services.Map')."
    );
});

it("throws when a component depends on itself via a larger cycle", function () {
    const components = mockComponents([
        {
            name: "a",
            bundle: "A",
            provides: ["A"],
            requires: ["B"]
        },
        {
            name: "b",
            bundle: "B",
            provides: ["B"],
            requires: ["D", "C"]
        },
        {
            name: "c",
            bundle: "C",
            provides: ["C"],
            requires: ["D", "D", "A"]
        },
        {
            name: "d",
            bundle: "D",
            provides: ["D"],
            requires: []
        }
    ]);

    assert.throws(
        () => verifyDependencies(components),
        "runtime:dependency-cycle: Detected dependency cycle: 'A::a' => 'B::b' ('dep_0' providing 'B') => 'C::c' ('dep_1' providing 'C') => 'A::a' ('dep_2' providing 'A')."
    );
});

interface ServiceData {
    bundle: string;
    name: string;
    requires: string[];
    provides: string[];
}

function mockComponents(data: ServiceData[]): ServiceRepr[] {
    return data.map<ServiceRepr>((service) => {
        const name = service.name;
        const bundleName = service.bundle;
        const clazz = class MockService {};
        const dependencies = service.requires.map<Dependency>((interfaceName, index) => {
            return {
                name: `dep_${index}`,
                interface: interfaceName
            };
        });
        return new ServiceRepr({
            name,
            bundleName,
            clazz,
            dependencies,
            interfaces: service.provides
        });
    });
}
