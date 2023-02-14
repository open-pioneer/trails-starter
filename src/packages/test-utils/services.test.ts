/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceOptions } from "@open-pioneer/runtime";
import { expect, it } from "vitest";
import { createService } from "./services";

interface OtherService {
    foo(): void;
    bar(): number;
}

interface ServiceReferences {
    other: OtherService;
}

class Service {
    $opts: Record<string, unknown>;

    constructor(options: ServiceOptions<ServiceReferences>) {
        this.$opts = options;
    }
}

it("creates a new service instance", async () => {
    const service = await createService(Service);
    expect(service).toBeInstanceOf(Service);
    expect(service.$opts.references).toEqual({});
    expect(service.$opts.properties).toEqual({});
});

it("creates a new service instance with the defined references", async () => {
    const service = await createService(Service, {
        references: {
            other: {
                bar() {
                    return 123;
                }
            }
        }
    });
    const ref = (service.$opts.references as any).other;
    expect(ref.bar()).toBe(123);
});

it("creates a new service instance with the defined properties", async () => {
    const service = await createService(Service, {
        properties: {
            foo: "123"
        }
    });
    expect((service.$opts.properties as any).foo).toBe("123");
});
