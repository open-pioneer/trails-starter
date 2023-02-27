// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { createService } from "@open-pioneer/test-utils/services";
import { expect, it } from "vitest";
import { expectAsyncError } from "../test-utils/expectError";
import { ApiServiceImpl } from "./ApiServiceImpl";

it("merges methods from multiple providers to a combined method map", async function () {
    let fooCalled = 0;
    let barCalled = 0;

    const service = await createService(ApiServiceImpl, {
        references: {
            providers: [
                {
                    async getApiMethods() {
                        return {
                            foo: (a: unknown) => {
                                fooCalled += 1;
                                return a;
                            },
                            baz: () => undefined
                        };
                    }
                },
                {
                    async getApiMethods() {
                        return {
                            bar: () => {
                                barCalled += 1;
                                return 1;
                            }
                        };
                    }
                }
            ]
        }
    });

    const methods = await service.getApi();
    expect(Object.keys(methods).sort()).toEqual(["bar", "baz", "foo"]);

    const fooResult = methods.foo!(2);
    expect(fooResult).toBe(2);
    expect(fooCalled).toBe(1);

    const barResult = methods.bar!();
    expect(barResult).toBe(1);
    expect(barCalled).toBe(1);
});

it("reports an error if a method is defined multiple times", async function () {
    const service = await createService(ApiServiceImpl, {
        references: {
            providers: [
                {
                    async getApiMethods() {
                        return {
                            foo: () => undefined
                        };
                    }
                },
                {
                    async getApiMethods() {
                        // Ensure this completes after the other one
                        await new Promise((resolve) => {
                            setTimeout(resolve, 1);
                        });
                        return {
                            foo: () => undefined
                        };
                    }
                }
            ]
        }
    });

    const error = await expectAsyncError(() => service.getApi());
    expect(error.message).toMatchInlineSnapshot(
        "\"runtime:duplicate-api-methods: Cannot define API method 'foo' from 'test-utils::providers-1' (method is also defined by 'test-utils::providers-0').\""
    );
});
