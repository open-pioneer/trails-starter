// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
import { it, expect } from "vitest";
import { GreeterImpl } from "./GreeterImpl";

it("greets with expected message", () => {
    const greeter = new GreeterImpl();
    expect(greeter.greet()).toMatchInlineSnapshot('"Hello from Greeter"');
});
