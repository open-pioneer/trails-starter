import { expect, it } from "vitest";
import { FoundService, Service, ServiceOptions } from "../Service";
import { PackageRepr } from "./PackageRepr";
import { ServiceLayer } from "./ServiceLayer";
import { ServiceRepr } from "./ServiceRepr";

it("starts and stops services in the expected order", function () {
    let events: string[] = [];

    class ServiceA implements Service {
        constructor(
            options: ServiceOptions<{
                b: unknown;
            }>
        ) {
            if (!(options.references.b instanceof ServiceB)) {
                throw new Error("unexpected value for service b");
            }

            events.push("construct-a");
        }

        destroy(): void {
            events.push("destroy-a");
        }
    }

    class ServiceB implements Service {
        constructor() {
            events.push("construct-b");
        }

        destroy() {
            events.push("destroy-b");
        }
    }

    const serviceLayer = new ServiceLayer([
        new PackageRepr({
            name: "a",
            services: [
                new ServiceRepr({
                    name: "A",
                    packageName: "a",
                    clazz: ServiceA,
                    dependencies: [
                        {
                            referenceName: "b",
                            interfaceName: "b.serviceB"
                        }
                    ]
                })
            ]
        }),
        new PackageRepr({
            name: "b",
            services: [
                new ServiceRepr({
                    name: "B",
                    packageName: "b",
                    clazz: ServiceB,
                    interfaces: ["b.serviceB"]
                })
            ]
        })
    ]);

    serviceLayer.start();
    expect(events).toEqual(["construct-b", "construct-a"]); // dep before usage
    events = [];

    serviceLayer.destroy();
    expect(events).toEqual(["destroy-a", "destroy-b"]); // reverse order
});

it("destroys services once they are no longer referenced (but not before)", function () {
    let events: string[] = [];

    class ServiceUser implements Service {
        private provider: ServiceProvider;
        private id: string;

        constructor(
            options: ServiceOptions<{
                provider: ServiceProvider;
            }>
        ) {
            this.provider = options.references.provider;
            if (this.provider.destroyed) {
                throw new Error("Illegal state: provider destroyed while still being referenced.");
            }

            const id = options.properties.id;
            if (typeof id !== "string") {
                throw new Error("Expected the `id` property to be a string.");
            }
            this.id = id;

            events.push(`construct-${id}`);
        }

        destroy(): void {
            if (this.provider.destroyed) {
                throw new Error("Illegal state: provider destroyed while still being referenced.");
            }

            events.push(`destroy-${this.id}`);
        }
    }

    class ServiceProvider implements Service {
        destroyed = false;

        constructor() {
            events.push("construct-provider");
        }

        destroy() {
            this.destroyed = true;
            events.push("destroy-provider");
        }
    }

    const providerService = new ServiceRepr({
        name: "Provider",
        packageName: "ProviderPackage",
        clazz: ServiceProvider,
        interfaces: ["provider.Service"]
    });

    const serviceLayer = new ServiceLayer([
        new PackageRepr({
            name: "UserPackage",
            services: [
                new ServiceRepr({
                    name: "A",
                    packageName: "UserPackage",
                    clazz: ServiceUser,
                    dependencies: [
                        {
                            referenceName: "provider",
                            interfaceName: "provider.Service"
                        }
                    ],
                    properties: {
                        id: "A"
                    }
                }),
                new ServiceRepr({
                    name: "B",
                    packageName: "UserPackage",
                    clazz: ServiceUser,
                    dependencies: [
                        {
                            referenceName: "provider",
                            interfaceName: "provider.Service"
                        }
                    ],
                    properties: {
                        id: "B"
                    }
                })
            ]
        }),

        new PackageRepr({
            name: "ProviderPackage",
            services: [providerService]
        })
    ]);

    serviceLayer.start();
    expect(events[0]).toBe("construct-provider"); // before users
    expect(new Set(events.slice(1))).toEqual(new Set(["construct-B", "construct-A"])); // ignore order
    expect(providerService.useCount).toBe(3);
    expect(providerService.state).toBe("constructed");

    events = [];
    serviceLayer.destroy();
    expect(events[2]).toBe("destroy-provider"); // after users
    expect(new Set(events.slice(0, 2))).toEqual(new Set(["destroy-B", "destroy-A"])); // ignore order
    expect(providerService.useCount).toBe(0);
    expect(providerService.state).toBe("destroyed");
});

it("allows access to service instances if the dependency was declared", function () {
    class Dummy {}

    const serviceLayer = new ServiceLayer([
        new PackageRepr({
            name: "TestPackage",
            services: [
                new ServiceRepr({
                    name: "A",
                    packageName: "TestPackage",
                    clazz: Dummy,
                    dependencies: [],
                    interfaces: ["testpackage.Interface", "testpackage.OtherInterface"]
                })
            ],
            uiInterfaces: ["testpackage.Interface"]
        })
    ]);
    serviceLayer.start();

    const resultDeclared = serviceLayer.getService("TestPackage", "testpackage.Interface");
    expect(resultDeclared.type).toBe("found");
    expect((resultDeclared as FoundService).instance).toBeDefined();

    const resultUndeclared = serviceLayer.getService("TestPackage", "testpackage.OtherInterface");
    expect(resultUndeclared.type).toBe("undeclared");

    const resultUndeclared2 = serviceLayer.getService("whatever", "testpackage.Interface");
    expect(resultUndeclared2.type, "undeclared");

    serviceLayer.destroy();
});

it("injects properties into service instances", function () {
    let properties: Record<string, unknown> | undefined;

    const service = new ServiceRepr({
        name: "Service",
        packageName: "pkg",
        interfaces: ["testpackage.Interface"],
        properties: {
            foo: "bar"
        },
        clazz: class Service {
            constructor(options: ServiceOptions) {
                properties = options.properties;
            }
        }
    });
    const serviceLayer = new ServiceLayer([
        new PackageRepr({
            name: "TestPackage",
            services: [service],
            uiInterfaces: ["testpackage.Interface"]
        })
    ]);
    serviceLayer.start();

    expect(service.instance).toBeDefined();
    expect(properties).toStrictEqual({
        foo: "bar"
    });

    serviceLayer.destroy();
});
