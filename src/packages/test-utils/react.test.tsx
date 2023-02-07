/**
 * @vitest-environment jsdom
 */
import { expect, it } from "vitest";
import { screen, render } from "@testing-library/react";
import { PackageContextProvider, PackageContextProviderProps } from "./react";
import { useProperties, useService } from "open-pioneer:react-hooks";

it("should allow injection of service from the test", async () => {
    function Component() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = useService("testService") as any;
        return <div>{service.getMessage()}</div>;
    }

    const mocks: PackageContextProviderProps = {
        services: {
            testService: {
                getMessage() {
                    return "Hello World!";
                }
            }
        }
    };

    render(
        <PackageContextProvider {...mocks}>
            <Component />
        </PackageContextProvider>
    );

    const div = await screen.findByText("Hello World!");
    expect(div.tagName).toBe("DIV");
});

it("should allow injection of properties from the test", async () => {
    function Component() {
        const properties = useProperties();
        return <div>{properties.message as string}</div>;
    }

    const mocks: PackageContextProviderProps = {
        properties: {
            "@open-pioneer/test-utils": {
                message: "Hello World!"
            }
        }
    };

    render(
        <PackageContextProvider {...mocks}>
            <Component />
        </PackageContextProvider>
    );

    const div = await screen.findByText("Hello World!");
    expect(div.tagName).toBe("DIV");
});
