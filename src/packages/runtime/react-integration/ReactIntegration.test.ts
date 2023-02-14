/**
 * @vitest-environment jsdom
 */
import { createElement } from "react";
import { beforeEach, expect, it } from "vitest";
import { usePropertiesInternal, useServiceInternal, useServicesInternal } from "./hooks";
import { findByText } from "@testing-library/dom";
import { Service, ServiceConstructor } from "../Service";
// eslint-disable-next-line import/no-relative-packages
import { UIWithProperties, UIWithService, UIWithServices } from "./test-data/test-package/UI";
import { ServiceLayer } from "../service-layer/ServiceLayer";
import { ReactIntegration } from "./ReactIntegration";
import { act } from "react-dom/test-utils";
import { PackageRepr } from "../service-layer/PackageRepr";
import { createConstructorFactory, ServiceRepr } from "../service-layer/ServiceRepr";
import { InterfaceSpec, ReferenceSpec } from "../service-layer/InterfaceSpec";

interface TestProvider {
    value: string;
}

beforeEach(() => {
    document.body.innerHTML = "";
});

it("should allow access to service via react hook", async () => {
    function TestComponent() {
        const service = useServiceInternal("test", "test.Provider") as TestProvider;
        return createElement("span", undefined, `Hello ${service.value}`);
    }

    const { wrapper, integration } = createIntegration({
        packageUiReferences: [{ interfaceName: "test.Provider" }],
        services: [
            {
                name: "Provider",
                interfaces: [{ interfaceName: "test.Provider" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST";
                }
            }
        ]
    });

    act(() => {
        integration.render(TestComponent, {});
    });

    const node = await findByText(wrapper, "Hello TEST");
    expect(node).toMatchSnapshot();
});

it("should get error when using undefined service", async () => {
    function TestComponent() {
        const service = useServiceInternal("test", "test.Provider") as TestProvider;
        return createElement("span", undefined, `Hello ${service.value}`);
    }

    const { integration } = createIntegration({
        disablePackage: true
    });

    expect(() => {
        act(() => {
            integration.render(TestComponent, {});
        });
    }).toThrowErrorMatchingSnapshot();
});

it("should allow access to service with qualifier via react hook", async () => {
    function TestComponent() {
        const service = useServiceInternal("test", "test.Provider", {
            qualifier: "foo"
        }) as TestProvider;
        return createElement("span", undefined, `Hello ${service.value}`);
    }

    const { wrapper, integration } = createIntegration({
        services: [
            {
                name: "Provider",
                interfaces: [{ interfaceName: "test.Provider", qualifier: "foo" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST";
                }
            }
        ],
        packageUiReferences: [{ interfaceName: "test.Provider", qualifier: "foo" }]
    });

    act(() => {
        integration.render(TestComponent, {});
    });

    const node = await findByText(wrapper, "Hello TEST");
    expect(node).toMatchSnapshot();
});

it("should deny access to service when the qualifier does not match", async () => {
    function TestComponent() {
        const service = useServiceInternal("test", "test.Provider", {
            qualifier: "bar"
        }) as TestProvider;
        return createElement("span", undefined, `Hello ${service.value}`);
    }

    const { integration } = createIntegration({
        services: [
            {
                name: "Provider",
                interfaces: [{ interfaceName: "test.Provider", qualifier: "foo" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST";
                }
            }
        ],
        packageUiReferences: [{ interfaceName: "test.Provider", qualifier: "foo" }]
    });

    expect(() => {
        act(() => {
            integration.render(TestComponent, {});
        });
    }).toThrowErrorMatchingSnapshot();
});

it("should allow access to all services via react hook", async () => {
    function TestComponent() {
        const services = useServicesInternal("test", "test.Provider") as TestProvider[];
        return createElement(
            "span",
            undefined,
            `Joined Values: ${services.map((s) => s.value).join()}`
        );
    }

    const { wrapper, integration } = createIntegration({
        services: [
            {
                name: "Provider1",
                interfaces: [{ interfaceName: "test.Provider", qualifier: "foo" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST1";
                }
            },
            {
                name: "Provider2",
                interfaces: [{ interfaceName: "test.Provider", qualifier: "bar" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST2";
                }
            },
            {
                name: "Provider3",
                interfaces: [{ interfaceName: "test.Provider", qualifier: "baz" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST3";
                }
            }
        ],
        packageUiReferences: [{ interfaceName: "test.Provider", all: true }]
    });

    act(() => {
        integration.render(TestComponent, {});
    });

    const node = await findByText(wrapper, /^Joined Values:/);
    expect(node).toMatchSnapshot();
});

it("should deny access to all services if declaration is missing", async () => {
    function TestComponent() {
        const services = useServicesInternal("test", "test.Provider") as TestProvider[];
        return createElement(
            "span",
            undefined,
            `Joined Values: ${services.map((s) => s.value).join()}`
        );
    }

    const { integration } = createIntegration({
        services: []
    });

    expect(() => {
        act(() => {
            integration.render(TestComponent, {});
        });
    }).toThrowErrorMatchingSnapshot();
});

it("should be able to read properties from react component", async () => {
    function TestComponent() {
        const properties = usePropertiesInternal("test");
        return createElement("span", undefined, `Hello ${properties.name}`);
    }

    const { wrapper, integration } = createIntegration({
        packageProperties: {
            name: "USER"
        }
    });

    act(() => {
        integration.render(TestComponent, {});
    });

    const node = await findByText(wrapper, "Hello USER");
    expect(node).toMatchSnapshot();
});

it("should provide the autogenerated useService hook", async () => {
    const testPackageName = "@open-pioneer/runtime__react_test_package";
    const { wrapper, integration } = createIntegration({
        packageName: testPackageName,
        packageUiReferences: [{ interfaceName: "test.Provider" }],
        services: [
            {
                name: "Provider",
                interfaces: [{ interfaceName: "test.Provider" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST";
                }
            }
        ]
    });

    act(() => {
        integration.render(UIWithService, {});
    });

    const node = await findByText(wrapper, /^Test-UI:/);
    expect(node).toMatchSnapshot();
});

it("should provide the autogenerated useServices hook", async () => {
    const testPackageName = "@open-pioneer/runtime__react_test_package";
    const { wrapper, integration } = createIntegration({
        packageName: testPackageName,
        packageUiReferences: [{ interfaceName: "test.Provider", all: true }],
        services: [
            {
                name: "Provider1",
                interfaces: [{ interfaceName: "test.Provider" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST1";
                }
            },
            {
                name: "Provider2",
                interfaces: [{ interfaceName: "test.Provider" }],
                clazz: class Provider implements Service<TestProvider> {
                    value = "TEST2";
                }
            }
        ]
    });

    act(() => {
        integration.render(UIWithServices, {});
    });

    const node = await findByText(wrapper, /^Test-UI:/);
    expect(node).toMatchSnapshot();
});

it("should provide the autogenerated useProperties hook", async () => {
    const testPackageName = "@open-pioneer/runtime__react_test_package";
    const { wrapper, integration } = createIntegration({
        packageName: testPackageName,
        packageProperties: {
            greeting: "Hello World!"
        }
    });

    act(() => {
        integration.render(UIWithProperties, {});
    });

    const node = await findByText(wrapper, /^Test-UI:/);
    expect(node).toMatchSnapshot();
});

it("should throw error when requesting properties from an unknown package", async () => {
    const { integration } = createIntegration({
        disablePackage: true
    });

    function TestComponent() {
        const properties = usePropertiesInternal("test");
        return createElement("span", undefined, `Hello ${properties.name}`);
    }

    expect(() => {
        act(() => {
            integration.render(TestComponent, {});
        });
    }).toThrowErrorMatchingSnapshot();
});

interface ServiceSpec {
    name: string;
    interfaces: InterfaceSpec[];
    clazz: ServiceConstructor;
}

export interface TestIntegration {
    wrapper: HTMLDivElement;
    integration: ReactIntegration;
}

function createIntegration(options?: {
    disablePackage?: boolean;
    packageName?: string;
    packageProperties?: Record<string, unknown>;
    packageUiReferences?: ReferenceSpec[];
    services?: ServiceSpec[];
}): TestIntegration {
    const wrapper = document.createElement("div");
    const packages = new Map<string, PackageRepr>();
    if (!options?.disablePackage) {
        const packageName = options?.packageName ?? "test";
        const services =
            options?.services?.map((spec) => {
                return new ServiceRepr({
                    name: spec.name,
                    packageName,
                    interfaces: spec.interfaces,
                    factory: createConstructorFactory(spec.clazz)
                });
            }) ?? [];
        packages.set(
            packageName,
            new PackageRepr({
                name: packageName,
                properties: options?.packageProperties,
                uiReferences: options?.packageUiReferences,
                services
            })
        );
    }

    const serviceLayer = new ServiceLayer(Array.from(packages.values()));
    serviceLayer.start();

    const integration = new ReactIntegration({
        container: wrapper,
        rootNode: wrapper,
        packages,
        serviceLayer
    });
    return { integration, wrapper };
}
