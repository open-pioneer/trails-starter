// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PackageContextProvider } from "@open-pioneer/test-utils/react";
import { SimpleUiComponent } from "./SimpleUiComponent";

it("simple ui component is rendered", async () => {
    /* The `PackageContextProvider` sets up  a test environment for chakra components and 
    enables hooks such as useService and useIntl within its children */
    render(
        <PackageContextProvider>
            <SimpleUiComponent
                textToShow="rendered successfully"
                data-testid="uiDiv"
            ></SimpleUiComponent>
        </PackageContextProvider>
    );

    const { element } = await waitForUi();
    expect(element.innerText).toBe("rendered successfully");
    expect(element).toMatchSnapshot();
});

async function waitForUi() {
    const uiDiv: HTMLDivElement | null = await screen.findByTestId<HTMLDivElement>("uiDiv");
    if (!uiDiv) {
        throw new Error("UI not rendered");
    }
    return {
        element: uiDiv
    };
}
