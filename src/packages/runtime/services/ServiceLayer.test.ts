import { expect, it } from "vitest";
import { BundleMetadata } from "../Metadata";
import { ServiceLayer } from "./ServiceLayer";

class ClazzA {}

class ClazzB {}

it("parses bundle metadata into internal bundle representations", function () {
    const metadata: Record<string, BundleMetadata> = {
        b: {
            name: "b",
            services: {
                B: {
                    name: "B",
                    clazz: ClazzB,
                    provides: [
                        {
                            interface: "b.ServiceB1"
                        },
                        {
                            interface: "b.ServiceB2"
                        }
                    ],
                    references: {
                        "member": {
                            interface: "c.ServiceC"
                        }
                    }
                }
            }
        },
        a: {
            name: "a",
            services: {
                A: {
                    name: "A",
                    clazz: ClazzA,
                    provides: [],
                    references: {
                        "foo": {
                            interface: "b.ServiceB1"
                        }
                    }
                }
            }
        }
    };
    
    const serviceLayer = new ServiceLayer(metadata);
    const bundles = serviceLayer.bundles;
    expect(bundles).toHaveLength(2);

    const bundleA = bundles.find(b => b.name === "a")!;
    expect(bundleA).toBeDefined();

    const serviceA = bundleA.services.find(s => s.name === "A")!;
    expect(serviceA).toBeDefined();
    expect(serviceA.id).toStrictEqual("a::A");
    expect(serviceA.state).toStrictEqual("not-constructed");
    expect(serviceA.instance).toBeUndefined();
    expect(serviceA.dependencies).toEqual([{
        name: "foo",
        interface: { interface: "b.ServiceB1" }
    }]);
    expect(serviceA.interfaces).toEqual([]);

    const bundleB = bundles.find(b => b.name === "b")!;
    expect(bundleB).toBeDefined();
    
    const serviceB = bundleB.services.find(s => s.name === "B")!;
    expect(serviceB).toBeDefined();
    expect(serviceB.interfaces).toEqual([
        "b.ServiceB1",
        "b.ServiceB2"
    ]);

    expect(serviceLayer.serviceIndex.size).toBe(2);
    expect(serviceLayer.serviceIndex.get("b.ServiceB1")).toBe(serviceB);
    expect(serviceLayer.serviceIndex.get("b.ServiceB2")).toBe(serviceB);
});
