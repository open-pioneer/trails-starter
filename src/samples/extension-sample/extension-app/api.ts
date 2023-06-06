// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Represents an action that can be triggered by the user.
 */
export interface Action {
    /** Unique action id. */
    id: string;

    /** Action text for rendering. */
    text: string;

    /** Function to call when the action is triggered by the user. */
    trigger(): void;
}

/**
 * Provides actions to the {@link ActionService}.
 */
export interface ActionProvider {
    /**
     * Called by the {@link ActionService} to gather registered actions.
     *
     * Note that this sample currently currently does not support changing actions at runtime (e.g. listening to changes).
     */
    createActions(): Action[];
}

/**
 * Gathers actions and makes them accessible to the UI.
 *
 * Implement the interface `"extension-app.ActionProvider"` to provide additional actions.
 */
export interface ActionService {
    /**
     * Returns the rendering information for all registered actions.
     */
    getActionInfo(): { id: string; text: string }[];

    /**
     * Called by the UI to trigger an action.
     */
    triggerAction(id: string): void;
}

import "@open-pioneer/runtime";
declare module "@open-pioneer/runtime" {
    interface ServiceRegistry {
        "extension-app.ActionProvider": ActionProvider;
        "extension-app.ActionService": ActionService;
    }
}
