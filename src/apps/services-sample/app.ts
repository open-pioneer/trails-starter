import { Service, createCustomElement, ServiceOptions } from "@open-pioneer/runtime";
import { BundleMetadata } from "@open-pioneer/runtime/Metadata";

interface UserReferences {
    provider: ProviderInterface;
}

interface ProviderInterface {
    sayHello(): void;
}

const bundles: Record<string, BundleMetadata> = {
    "test-bundle1": {
        name: "test-bundle1",
        services: {
            User: {
                name: "User",
                clazz: class User implements Service {
                    #provider: ProviderInterface;
                    constructor(options: ServiceOptions<UserReferences>) {
                        this.#provider = options.references.provider;
                        this.#provider.sayHello();
                    }
                    destroy(): void {
                        console.log("User destroy");
                    }
                },
                references: {
                    provider: {
                        interface: "test-bundle2.SomeService"
                    }
                }
            }
        }
    },
    "test-bundle2": {
        name: "test-bundle2",
        services: {
            Provider: {
                name: "Provider",
                clazz: class Provider implements Service<ProviderInterface> {
                    sayHello() {
                        console.log("Hello from service of test-bundle2!");
                    }
                },
                provides: [
                    {
                        interface: "test-bundle2.SomeService"
                    }
                ]
            }
        }
    }
};

const Element = createCustomElement({
    component: "test",
    bundles
});

customElements.define("services-sample", Element);
