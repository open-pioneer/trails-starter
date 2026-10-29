// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { PackageContextProvider } from "@open-pioneer/test-utils/react";
import { messages, messageLocale } from "open-pioneer:test-support";
import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { SimpleUiComponent } from "./SimpleUiComponent";

it("simple ui component is rendered", async () => {
    /* The `PackageContextProvider` sets up  a test environment for chakra components and
    enables hooks such as useService and useIntl within its children. 
    Use the helpers from "open-pioneer:test-support" to pass the actual i18n messages.*/
    const screen = await render(
        <PackageContextProvider messages={messages} locale={messageLocale}>
            <SimpleUiComponent textToShow="rendered successfully" data-testid="uiDiv" />
        </PackageContextProvider>
    );

    const uiDiv = screen.getByTestId("uiDiv");
    await expect.element(uiDiv).toHaveClass("simple-ui");

    // Check whether the actual i18n message has been rendered.
    await expect.element(uiDiv.getByText("The text to show:")).toBeInTheDocument();

    // Check whether the `textToShow` was rendered correctly
    await expect.element(uiDiv.getByText("rendered successfully")).toBeInTheDocument();
});
