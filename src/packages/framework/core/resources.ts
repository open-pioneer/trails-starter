// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0
/**
 * An object that has some cleanup code associated with it.
 */
export interface Resource {
    /** A function that releases any state held by the resource. */
    destroy(): void;
}

/**
 * A helper function that invokes `destroy()` on the given resource and returns undefined.
 *
 * Example:
 *
 * ```js
 * class Holder {
 *    private myResource: Resource | undefined;
 *
 *    destroy() {
 *        this.myResource = destroyResource(this.myResource);
 *    }
 * }
 * ```
 */
export function destroyResource<R extends Resource>(resource: R | undefined): undefined {
    resource?.destroy();
    return undefined;
}
