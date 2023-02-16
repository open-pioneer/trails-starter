/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReferenceMeta, ServiceOptions } from "@open-pioneer/runtime";
import { expect, it } from "vitest";
import { createService } from "./services";

interface OtherService {
    foo(): void;
    bar(): number;
}

interface ServiceReferences {
    other: OtherService;
    array: OtherService[];
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

it("creates a new service and provides metadata about references", async () => {
    const service = await createService(Service, {
        references: {
            other: {
                bar() {
                    return 123;
                }
            },
            array: [
                {
                    foo() {
                        return 0;
                    }
                },
                {
                    bar() {
                        return 1;
                    }
                }
            ]
        }
    });

    const meta = (service.$opts as any).referencesMeta;
    const other = meta.other as ReferenceMeta;
    expect(other.serviceId).toEqual(`test-utils::other`);

    const array = meta.array as ReferenceMeta[];
    expect(array).toHaveLength(2);
    expect(array[0]!.serviceId).toEqual(`test-utils::array-0`);
    expect(array[1]!.serviceId).toEqual(`test-utils::array-1`);
});
