import { expect, it } from "vitest";
import { PackageMetadata } from "../metadata";
import { parsePackages } from "./PackageRepr";

class ClazzA {}

class ClazzB {}

it("parses package metadata into internal package representations", function () {
    const metadata: Record<string, PackageMetadata> = {
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
                        foo: {
                            name: "b.ServiceB1"
                        }
                    }
                }
            }
        }
    };

    const packages = parsePackages(metadata);
    expect(packages).toHaveLength(2);

    const packageA = packages.find((b) => b.name === "a")!;
    expect(packageA).toBeDefined();

    const serviceA = packageA.services.find((s) => s.name === "A")!;
    expect(serviceA).toBeDefined();
    expect(serviceA.id).toStrictEqual("a::A");
    expect(serviceA.state).toStrictEqual("not-constructed");
    expect(serviceA.instance).toBeUndefined();
    expect(serviceA.dependencies).toEqual([
        {
            referenceName: "foo",
            interfaceName: "b.ServiceB1"
        }
    ]);
    expect(serviceA.interfaces).toEqual([]);

    const packageB = packages.find((b) => b.name === "b")!;
    expect(packageB).toBeDefined();

    const serviceB = packageB.services.find((s) => s.name === "B")!;
    expect(serviceB).toBeDefined();
    expect(serviceB.interfaces).toEqual(["b.ServiceB1", "b.ServiceB2"]);
});
