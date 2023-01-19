import { Service, createCustomElement, ServiceOptions } from "@open-pioneer/runtime";

function App() {
    return <div>Hello from services sample</div>;
}

interface UserReferences {
    provider: ProviderInterface;
}

interface ProviderInterface {
    sayHello(): void;
}

const Element = createCustomElement({
    component: <App/>,
    bundles: {
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
                            console.log("Hello from service!");
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
    }
});

customElements.define("services-sample", Element);
