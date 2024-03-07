// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { DeclaredService } from "@open-pioneer/runtime";

/**
 * The greeter produces a greeting message.
 */
export interface Greeter extends DeclaredService<"sample-package.Greeter"> {
    /**
     * Returns a greeting message.
     */
    greet(): string;
}

export { SimpleUiComponent, type SimpleUiComponentProps } from "./SimpleUiComponent";
