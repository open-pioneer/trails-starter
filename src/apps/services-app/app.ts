import { createCustomElement, Service, ServiceOptions } from "@open-pioneer/runtime";
import { PackageMetadata } from "@open-pioneer/runtime/metadata";
import { createElement } from "react";

interface UserReferences {
    provider: ProviderInterface;
}

interface ProviderInterface {
    sayHello(): void;
}

const packages: Record<string, PackageMetadata> = {
    "test-package1": {
        name: "test-package1",
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
                        name: "test-package2.SomeService"
                    }
                }
            }
        }
    },
    "test-package2": {
        name: "test-package2",
        services: {
            Provider: {
                name: "Provider",
                clazz: class Provider implements Service<ProviderInterface> {
                    sayHello() {
                        console.log("Hello from service of test-package2!");
                    }
                },
                provides: [
                    {
                        name: "test-package2.SomeService"
                    }
                ]
            }
        }
    }
};

const Element = createCustomElement({
    component: () =>
        createElement(
            "span",
            undefined,
            "This app has ad-hoc definitions for services and packages."
        ),
    packages: packages
});

customElements.define("services-app", Element);
