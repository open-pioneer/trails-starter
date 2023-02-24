/**
 * @vitest-environment jsdom
 */
import { isAbortError } from "@open-pioneer/core";
import {
    defineComponent,
    renderComponent,
    renderComponentShadowDOM
} from "@open-pioneer/test-utils/web-components";
import { waitFor } from "@testing-library/dom";
import { createElement } from "react";
import { expect, it, describe, vi, afterEach } from "vitest";
import { ApiExtension, ApiMethods, ApplicationContext } from "./api";
import { ApplicationElement, createCustomElement, CustomElementOptions } from "./CustomElement";
import { createBox } from "./metadata";
import { usePropertiesInternal } from "./react-integration";
import { ServiceOptions } from "./Service";
import { expectAsyncError } from "./test-utils/expectError";

describe("simple rendering", function () {
    const SIMPLE_STYLE = ".test { color: red }";
    const SIMPLE_ELEM = createCustomElement({
        component: () => createElement("div", { className: "test" }, "hello world"),
        appMetadata: {
            styles: createBox(SIMPLE_STYLE)
        }
    });
    customElements.define("simple-elem", SIMPLE_ELEM);

    it("should return html element", () => {
        expect(new SIMPLE_ELEM()).toBeInstanceOf(HTMLElement);
    });

    it("should render html", async () => {
        const { queries } = await renderComponentShadowDOM("simple-elem");
        const div = await queries.findByText("hello world");
        expect(div.className).toBe("test");
    });

    it("should render use styles", async () => {
        const { shadowRoot } = await renderComponentShadowDOM("simple-elem");
        const style = shadowRoot.querySelector("style")!;
        expect(style).toMatchSnapshot();
    });

    it("should clean up its content when removed from the dom", async () => {
        const { node, shadowRoot, innerContainer } = await renderComponentShadowDOM("simple-elem");
        node.remove();

        // Wait until divs are gone
        await waitFor(() => {
            const div = innerContainer.querySelector("div");
            if (div) {
                throw new Error("content still not destroyed");
            }
        });

        expect(shadowRoot.innerHTML).toBe("");
    });
});

it("explicitly setting the shadow dom mode hides the shadow root", async () => {
    function TestComponent() {
        return createElement("span", undefined, "Hello World");
    }

    const elem = createCustomElement({
        component: TestComponent,
        openShadowRoot: false
    });
    const { node } = await renderComponent(elem);
    expect(node.shadowRoot).toBeNull();
});

it("allows customization of package properties", async () => {
    const elem = createCustomElement({
        component: function TestComponent() {
            const properties = usePropertiesInternal("test");
            return createElement("span", undefined, properties.greeting as string);
        },
        appMetadata: {
            packages: {
                test: {
                    name: "test",
                    properties: {
                        greeting: {
                            value: "Hello World"
                        }
                    }
                }
            }
        },
        config: {
            properties: {
                test: {
                    greeting: "Hello User"
                }
            }
        }
    });

    const { queries } = await renderComponentShadowDOM(elem);
    const span = await queries.findByText("Hello User");
    expect(span.tagName).toBe("SPAN");
});

it("allows customization of package properties through a callback", async () => {
    const elem = createCustomElement({
        component: function TestComponent() {
            const properties = usePropertiesInternal("test");
            return createElement("span", undefined, properties.greeting as string);
        },
        appMetadata: {
            packages: {
                test: {
                    name: "test",
                    properties: {
                        greeting: {
                            value: "Hello World"
                        }
                    }
                }
            }
        },
        config: {
            properties: {
                test: {
                    greeting: "Hello User"
                }
            }
        },
        // properties from this callback take precedence
        async resolveConfig() {
            return {
                properties: {
                    test: {
                        greeting: "Bye User"
                    }
                }
            };
        }
    });

    const { queries } = await renderComponentShadowDOM(elem);
    const span = await queries.findByText("Bye User");
    expect(span.tagName).toBe("SPAN");
});

it("provides access to html containers through the application context", async () => {
    let hostElement: HTMLElement | undefined;
    let shadowRoot: ShadowRoot | undefined;
    let container: HTMLElement | undefined;

    class TestService {
        constructor(options: ServiceOptions<{ ctx: ApplicationContext }>) {
            const ctx = options.references.ctx;
            hostElement = ctx.getHostElement();
            shadowRoot = ctx.getShadowRoot();
            container = ctx.getApplicationContainer();
        }
    }

    const elem = createCustomElement({
        appMetadata: {
            packages: {
                test: {
                    name: "test",
                    services: {
                        testService: {
                            name: "testService",
                            clazz: TestService,
                            references: {
                                ctx: {
                                    name: "runtime.ApplicationContext"
                                }
                            },
                            provides: [
                                {
                                    name: "testInterface"
                                }
                            ]
                        }
                    },
                    ui: {
                        references: [
                            // Hack to start the service
                            {
                                name: "testInterface"
                            }
                        ]
                    }
                }
            }
        }
    });
    const {
        node: actualHostElement,
        shadowRoot: actualShadowRoot,
        innerContainer: actualContainer
    } = await renderComponentShadowDOM(elem);

    expect(hostElement).toBe(actualHostElement);
    expect(shadowRoot).toBe(actualShadowRoot);
    expect(container).toBe(actualContainer);
});

describe("element API", () => {
    it("should throw an error when trying to use the element's API without mounting it first", async () => {
        const elem = createCustomElement({});
        const tag = defineComponent(elem);
        const node = document.createElement(tag) as ApplicationElement;
        const error = await expectAsyncError(() => node.when());
        expect(error).toMatchSnapshot();
    });

    it("should provide an empty API by default", async () => {
        const elem = createCustomElement({});
        const { node } = await renderComponent(elem);
        const api = await (node as ApplicationElement).when();
        expect(api).toEqual({});
    });

    it("throws an error when the component is unmounted while waiting for the API", async function () {
        const elem = createCustomElement({});
        const tag = defineComponent(elem);
        const node = document.createElement(tag) as ApplicationElement;
        document.body.appendChild(node);

        const err = expectAsyncError(() => node.when());
        node.remove();

        const error = await err;
        expect(isAbortError(error)).toBe(true);
    });

    it("should allow services to provide an API", async () => {
        const events: string[] = [];
        class Extension implements ApiExtension {
            async getApiMethods(): Promise<ApiMethods> {
                return {
                    add(x: number, y: number) {
                        events.push("add");
                        return x + y;
                    },
                    otherMethod() {
                        events.push("otherMethod");
                    }
                };
            }
        }

        const elem = createCustomElement({
            appMetadata: {
                packages: {
                    test: {
                        name: "test",
                        services: {
                            testService: {
                                name: "testService",
                                provides: [
                                    {
                                        name: "integration.ApiExtension"
                                    }
                                ],
                                clazz: Extension
                            }
                        }
                    }
                }
            }
        });

        const { node } = await renderComponent(elem);
        const api = await (node as ApplicationElement).when();
        expect(Object.keys(api).sort()).toEqual(["add", "otherMethod"]);
        expect(events).toEqual([]);

        const sum = api.add!(3, 4);
        expect(sum).toEqual(7);
        expect(events).toEqual(["add"]);

        api.otherMethod!();
        expect(events).toEqual(["add", "otherMethod"]);
    });
});

describe("i18n support", function () {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("chooses locale from the supported browser locales (german)", async () => {
        const spy = vi.spyOn(window.navigator, "languages", "get");
        spy.mockReturnValue(["de-DE", "de", "en"]);

        const { locale, message } = await launchApp();
        expect(locale).toBe("de-DE");
        expect(message).toBe("Hallo Welt");
    });

    it("chooses locale from the supported browser locales (english)", async () => {
        const spy = vi.spyOn(window.navigator, "languages", "get");
        spy.mockReturnValue(["en-US", "en"]);

        const { locale, message } = await launchApp();
        expect(locale).toBe("en-US");
        expect(message).toBe("Hello world");
    });

    it("supports forcing to a specific locale", async () => {
        const spy = vi.spyOn(window.navigator, "languages", "get");
        spy.mockReturnValue(["en-US", "en"]);

        const { locale, message } = await launchApp({
            config: {
                locale: "de-simple"
            }
        });
        expect(locale).toBe("de-simple");
        expect(message).toBe("Hallo Welt (einfach)");
    });

    it("supports forcing to a specific locale with resolveConfig()", async () => {
        const spy = vi.spyOn(window.navigator, "languages", "get");
        spy.mockReturnValue(["en-US", "en"]);

        const { locale, message } = await launchApp({
            config: {
                locale: "en" // overwritten by resolveConfig
            },
            resolveConfig() {
                return Promise.resolve({
                    locale: "de-simple"
                });
            }
        });
        expect(locale).toBe("de-simple");
        expect(message).toBe("Hallo Welt (einfach)");
    });

    /**
     * Runs an app with mocked services and i18n and returns the inner locale + translated message.
     */
    async function launchApp(
        options?: Partial<CustomElementOptions>
    ): Promise<{ locale: string; message: string }> {
        class TestService implements ApiExtension {
            private locale: string;
            private message: string;

            constructor(options: ServiceOptions<{ ctx: ApplicationContext }>) {
                const ctx = options.references.ctx;
                this.locale = ctx.getLocale();
                this.message = options.intl.formatMessage({ id: "greeting" });
            }

            async getApiMethods(): Promise<ApiMethods> {
                return {
                    getValues: () => {
                        return {
                            locale: this.locale,
                            message: this.message
                        };
                    }
                };
            }
        }

        const elem = createCustomElement({
            ...options,
            appMetadata: {
                packages: {
                    test: {
                        name: "test",
                        services: {
                            testService: {
                                name: "testService",
                                clazz: TestService,
                                references: {
                                    ctx: {
                                        name: "runtime.ApplicationContext"
                                    }
                                },
                                provides: [
                                    {
                                        name: "integration.ApiExtension"
                                    }
                                ]
                            }
                        }
                    }
                },
                locales: ["de", "en", "de-simple"],
                async loadMessages(locale) {
                    switch (locale) {
                        case "en":
                            return {
                                test: {
                                    greeting: "Hello world"
                                }
                            };
                        case "de":
                            return {
                                test: {
                                    greeting: "Hallo Welt"
                                }
                            };
                        case "de-simple":
                            return {
                                test: {
                                    greeting: "Hallo Welt (einfach)"
                                }
                            };
                    }
                    throw new Error("Unsupported locale: " + locale);
                }
            }
        });

        const { node } = await renderComponentShadowDOM(elem);
        const api = await (node as ApplicationElement).when();
        return api.getValues!();
    }
});
