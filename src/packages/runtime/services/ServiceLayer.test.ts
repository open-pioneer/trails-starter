import { expect, it } from "vitest";
import { Service, ServiceOptions } from "../Service";
import { BundleRepr } from "./BundleRepr";
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
        new BundleRepr("a", [
            new ServiceRepr({
                name: "A",
                bundleName: "a",
                clazz: ServiceA,
                dependencies: [
                    {
                        name: "b",
                        interface: "b.serviceB"
                    }
                ]
            })
        ]),
        new BundleRepr("b", [
            new ServiceRepr({
                name: "B",
                bundleName: "b",
                clazz: ServiceB,
                interfaces: ["b.serviceB"]
            })
        ])
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

    const serviceLayer = new ServiceLayer([
        new BundleRepr("UserBundle", [
            new ServiceRepr({
                name: "A",
                bundleName: "UserBundle",
                clazz: ServiceUser,
                dependencies: [
                    {
                        name: "provider",
                        interface: "provider.Service"
                    }
                ],
                properties: {
                    id: "A"
                }
            }),
            new ServiceRepr({
                name: "B",
                bundleName: "UserBundle",
                clazz: ServiceUser,
                dependencies: [
                    {
                        name: "provider",
                        interface: "provider.Service"
                    }
                ],
                properties: {
                    id: "B"
                }
            })
        ]),
        new BundleRepr("ProviderBundle", [
            new ServiceRepr({
                name: "Provider",
                bundleName: "ProviderBundle",
                clazz: ServiceProvider,
                interfaces: ["provider.Service"]
            })
        ])
    ]);

    serviceLayer.start();
    expect(events[0]).toBe("construct-provider"); // before users
    expect(new Set(events.slice(1))).toEqual(new Set(["construct-B", "construct-A"])); // ignore order

    events = [];
    serviceLayer.destroy();
    expect(events[2]).toBe("destroy-provider"); // after users
    expect(new Set(events.slice(0, 2))).toEqual(new Set(["destroy-B", "destroy-A"])); // ignore order
});
