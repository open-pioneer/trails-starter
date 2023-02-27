// SPDX-FileCopyrightText: con terra GmbH and contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Maps a package name to its supported properties.
 *
 * By default, properties for all packages are untyped (as Record<string, unknown>).
 *
 * @example
 *
 * ```ts
 * declare module "@open-pioneer/runtime" {
 *     interface PropertiesRegistry {
 *         // Declares that properties for the "logging" package must
 *         // conform to the type on the right when overridden by an app.
 *         "logging": Partial<LoggingProperties>
 *     }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PropertiesRegistry {}
