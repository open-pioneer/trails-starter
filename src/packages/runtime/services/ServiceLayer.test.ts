import { expect, it } from "vitest";
import { Service, ServiceOptions } from "../Service";
import { BundleRepr } from "./BundleRepr";
import { ServiceLayer } from "./ServiceLayer";
import { ServiceRepr } from "./ServiceRepr";

it("starts and stops services in the expected order", function () {
    const events: string[] = [];

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
            new ServiceRepr(
                "A",
                "a",
                ServiceA,
                [
                    {
                        name: "b",
                        interface: "b.serviceB"
                    }
                ],
                []
            )
        ]),
        new BundleRepr("b", [new ServiceRepr("B", "b", ServiceB, [], ["b.serviceB"])])
    ]);

    serviceLayer.start();
    expect(events).toEqual(["construct-b", "construct-a"]); // dep before usage
    events.splice(0, events.length);

    serviceLayer.destroy();
    expect(events).toEqual(["destroy-a", "destroy-b"]); // reverse order
});
