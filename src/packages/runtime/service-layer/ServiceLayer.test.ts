import { expect, it } from "vitest";
import { createEmptyI18n } from "../I18n";
import { Service, ServiceOptions } from "../Service";
import { PackageRepr, PackageReprOptions } from "./PackageRepr";
import { ServiceLayer } from "./ServiceLayer";
import { Found } from "./ServiceLookup";
import {
    createConstructorFactory,
    createFunctionFactory,
    ServiceRepr,
    ServiceReprOptions
} from "./ServiceRepr";

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

    const packages = [
        createPackage({
            name: "a",
            services: [
                createService({
                    name: "A",
                    packageName: "a",
                    factory: createConstructorFactory(ServiceA),
                    interfaces: [
                        {
                            interfaceName: "a.serviceA"
                        }
                    ],
                    dependencies: [
                        {
                            referenceName: "b",
                            interfaceName: "b.serviceB"
                        }
                    ]
                })
            ]
        }),
        createPackage({
            name: "b",
            services: [
                createService({
                    name: "B",
                    packageName: "b",
                    factory: createConstructorFactory(ServiceB),
                    interfaces: [{ interfaceName: "b.serviceB" }]
                })
            ]
        })
    ];
    const forcedReferences = [
        {
            interfaceName: "a.serviceA"
        }
    ];
    const serviceLayer = new ServiceLayer(packages, forcedReferences);

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

            if (options.referencesMeta.provider.serviceId !== "provider-package::Provider") {
                throw new Error("Unexpected service id from reference metadata.");
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

    const providerService = createService({
        name: "Provider",
        packageName: "provider-package",
        factory: createConstructorFactory(ServiceProvider),
        interfaces: [{ interfaceName: "provider.Service" }]
    });

    const packages = [
        createPackage({
            name: "user-package",
            services: [
                createService({
                    name: "A",
                    packageName: "user-package",
                    factory: createConstructorFactory(ServiceUser),
                    dependencies: [
                        {
                            referenceName: "provider",
                            interfaceName: "provider.Service"
                        }
                    ],
                    interfaces: [
                        {
                            interfaceName: "user-package.A"
                        }
                    ],
                    properties: {
                        id: "A"
                    }
                }),
                createService({
                    name: "B",
                    packageName: "user-package",
                    factory: createConstructorFactory(ServiceUser),
                    dependencies: [
                        {
                            referenceName: "provider",
                            interfaceName: "provider.Service"
                        }
                    ],
                    interfaces: [
                        {
                            interfaceName: "user-package.B"
                        }
                    ],
                    properties: {
                        id: "B"
                    }
                })
            ]
        }),

        createPackage({
            name: "provider-package",
            services: [providerService]
        })
    ];
    const forcedReferences = [
        {
            interfaceName: "user-package.A"
        },
        {
            interfaceName: "user-package.B"
        }
    ];
    const serviceLayer = new ServiceLayer(packages, forcedReferences);

    serviceLayer.start();
    expect(events[0]).toBe("construct-provider"); // before users
    expect(new Set(events.slice(1))).toEqual(new Set(["construct-B", "construct-A"])); // ignore order
    expect(providerService.useCount).toBe(2);
    expect(providerService.state).toBe("constructed");

    events = [];
    serviceLayer.destroy();
    expect(events[2]).toBe("destroy-provider"); // after users
    expect(new Set(events.slice(0, 2))).toEqual(new Set(["destroy-B", "destroy-A"])); // ignore order
    expect(providerService.useCount).toBe(0);
    expect(providerService.state).toBe("destroyed");
});

it("supports using a function to create service instances", function () {
    let called = 0;

    type HelloService = Service<{ hello(): string }>;

    const factory = (options: ServiceOptions): HelloService => {
        ++called;
        return {
            hello() {
                return `Hello ${options.properties.target}!`;
            }
        };
    };

    const service = createService({
        name: "A",
        packageName: "a",
        factory: createFunctionFactory(factory),
        interfaces: [
            {
                interfaceName: "foo"
            }
        ],
        properties: {
            target: "world"
        }
    });
    const serviceLayer = new ServiceLayer(
        [
            createPackage({
                name: "a",
                services: [service]
            })
        ],
        [
            {
                interfaceName: "foo"
            }
        ]
    );

    serviceLayer.start();
    expect(called).toBe(1);

    const instance = service.getInstanceOrThrow();
    const message = (instance as HelloService).hello();
    expect(message).toEqual("Hello world!");
});

it("injects all implementations of an interface when requested", function () {
    interface Extension {
        readonly id: string;
    }

    const extensions: string[] = [];
    const extensionsServiceIds: string[] = [];

    class ExtensibleService {
        constructor(
            options: ServiceOptions<{
                extensions: Extension[];
            }>
        ) {
            options.references.extensions.forEach((ext) => extensions.push(ext.id));
            options.referencesMeta.extensions.forEach((meta) =>
                extensionsServiceIds.push(meta.serviceId)
            );
        }
    }

    class Ext1 implements Service<Extension> {
        id = "ext1";
    }

    class Ext2 implements Service<Extension> {
        id = "ext2";
    }

    const packages = [
        createPackage({
            name: "test",
            services: [
                createService({
                    name: "ExtensibleService",
                    packageName: "test",
                    factory: createConstructorFactory(ExtensibleService),
                    dependencies: [
                        {
                            referenceName: "extensions",
                            interfaceName: "test.Extension",
                            all: true
                        }
                    ],
                    interfaces: [
                        {
                            interfaceName: "extensible.Service"
                        }
                    ]
                }),
                createService({
                    name: "Ext1",
                    packageName: "test",
                    factory: createConstructorFactory(Ext1),
                    interfaces: [
                        {
                            interfaceName: "test.Extension",
                            qualifier: "qualifier-ext1"
                        }
                    ]
                }),
                createService({
                    name: "Ext2",
                    packageName: "test",
                    factory: createConstructorFactory(Ext2),
                    interfaces: [
                        {
                            interfaceName: "test.Extension",
                            qualifier: "qualifier-ext2"
                        }
                    ]
                })
            ]
        })
    ];
    const forcedReferences = [
        {
            interfaceName: "extensible.Service"
        }
    ];
    const serviceLayer = new ServiceLayer(packages, forcedReferences);

    serviceLayer.start();
    extensions.sort();
    extensionsServiceIds.sort();
    expect(extensions).toEqual(["ext1", "ext2"]);
    expect(extensionsServiceIds).toEqual(["test::Ext1", "test::Ext2"]);
    serviceLayer.destroy();
});

it("allows access to service instances if the dependency was declared", function () {
    class Dummy {}

    const serviceLayer = new ServiceLayer([
        createPackage({
            name: "test-package",
            services: [
                createService({
                    name: "A",
                    packageName: "test-package",
                    factory: createConstructorFactory(Dummy),
                    dependencies: [],
                    interfaces: [
                        { interfaceName: "testpackage.Interface" },
                        { interfaceName: "testpackage.OtherInterface" }
                    ]
                })
            ],
            uiReferences: [{ interfaceName: "testpackage.Interface" }]
        })
    ]);
    serviceLayer.start();

    const resultDeclared = serviceLayer.getService("test-package", {
        interfaceName: "testpackage.Interface"
    });
    expect(resultDeclared.type).toBe("found");
    expect((resultDeclared as Found<Service>).value).toBeDefined();

    const resultUndeclared = serviceLayer.getService("test-package", {
        interfaceName: "testpackage.OtherInterface"
    });
    expect(resultUndeclared.type).toBe("undeclared");

    const resultUndeclared2 = serviceLayer.getService("whatever", {
        interfaceName: "testpackage.Interface"
    });
    expect(resultUndeclared2.type, "undeclared");

    serviceLayer.destroy();
});

it("injects properties into service instances", function () {
    let properties: Record<string, unknown> | undefined;

    const service = createService({
        name: "Service",
        packageName: "pkg",
        interfaces: [{ interfaceName: "testpackage.Interface" }],
        properties: {
            foo: "bar"
        },
        factory: createConstructorFactory(
            class Service {
                constructor(options: ServiceOptions) {
                    properties = options.properties;
                }
            }
        )
    });
    const serviceLayer = new ServiceLayer([
        createPackage({
            name: "test-package",
            services: [service],
            uiReferences: [{ interfaceName: "testpackage.Interface" }]
        })
    ]);
    serviceLayer.start();

    expect(service.instance).toBeDefined();
    expect(properties).toStrictEqual({
        foo: "bar"
    });

    serviceLayer.destroy();
});

function createService(options: Partial<ServiceReprOptions>) {
    return new ServiceRepr({
        name: "test-service",
        packageName: "test-package",
        factory: createConstructorFactory(class {}),
        i18n: createEmptyI18n(),
        ...options
    });
}

function createPackage(options: Partial<PackageReprOptions>) {
    return new PackageRepr({
        name: "test-package",
        i18n: createEmptyI18n(),
        ...options
    });
}
